

import { Types } from "mongoose";
import { Pokemon, PokemonModel } from "../models/Pokemon";
import { Team, TeamModel } from "../models/Team"
import { UserModel } from "../models/User";
import { error } from "console";
import { PokemonSpecies, PokemonSpeciesModel } from "../models/PokemonSpecies";
import { rmSync } from "fs";
import { Move } from "../models/Move";
import { Ref } from "@typegoose/typegoose";
import { Ability } from "../models/Ability";
import { Stats } from "../models/Stats";
import { getPokemonAndMoves } from "./PokemonSpeciesService";


export class TeamService {


  constructor() {

  }
  async blankTeam(userId: string): Promise<Team> {

    let newTeam: Team = { pokemon: [] };

    const savedTeam = (await TeamModel.insertOne(newTeam));

    const user = await UserModel.findById(userId)

    user?.teams.push(savedTeam._id)

    await user?.save()


    return savedTeam.toObject()


  }

  async addPokemon(pokemon: Partial<Pokemon>, teamId: string): Promise<Pokemon> {

    const team = await TeamModel.findById(teamId)
    if (!team || team.pokemon && team?.pokemon?.length >= 6) {
      throw new Error("teams can only have 6 pokemon")
    }

   

    const pokemonSpecies = await getPokemonAndMoves(pokemon.pokemonSpecies?.toString() || '',{})

    const pokemonStats:Stats = new Stats()
    
    pokemonStats.hp = calculatePokemonStat(true,100,31,0,pokemonSpecies?.baseStats.hp || 0,"")
    pokemonStats.attack= calculatePokemonStat(false,100,31,0,pokemonSpecies?.baseStats.attack || 0,"")
    pokemonStats.defense = calculatePokemonStat(false,100,31,0,pokemonSpecies?.baseStats.defense || 0,"")
    pokemonStats.specialDefense = calculatePokemonStat(false,100,31,0,pokemonSpecies?.baseStats.specialDefense || 0,"")
    pokemonStats.specialAttack = calculatePokemonStat(false,100,31,0,pokemonSpecies?.baseStats.specialAttack || 0,"")
    pokemonStats.speed = calculatePokemonStat(false,100,31,0,pokemonSpecies?.baseStats.speed || 0,"")

    


    team?.pokemon?.push({
      nickname: pokemon.nickname,
      level:100,
      ability: pokemon.ability,
      pokemonSpecies: pokemon.pokemonSpecies ? pokemon.pokemonSpecies : "",
      stats:pokemonStats,
      moves: []
    });

    await team.save()


    const teamObj = team!.toObject()!;
    if (!teamObj.pokemon) {
      throw new Error("Pokemon array is undefined");
    }
    const p: Pokemon = teamObj.pokemon[teamObj.pokemon.length - 1]



    return p



  }

  async deletePokemon(pokemonId: string, teamId: string): Promise<Team> {

    const team = await TeamModel.findById(teamId)

    if (team?.pokemon == null) {
      throw new Error("This team has no pokemon")
    }


    const pokemon = team?.pokemon?.filter(x => x?._id && pokemonId !== x._id.toString())
    team.pokemon = pokemon
    await team?.save()

    return team.toObject()

  }

  async editPokemon(
    pokemonId: string,
    newPokemon: Partial<Pokemon>,
    teamId: string
  ): Promise<Pokemon> {

  
    const pokemonLegal = await this.checkPokemonLegal(newPokemon)
    if (!pokemonLegal) {
      throw new Error("Invalid pokemon")
    }
    // First, fetch the team document normally
    const team = await TeamModel.findById(teamId);
    if (!team || !team.pokemon) {
      throw new Error("Team not found or team has no pokemon");
    }

    // Locate the Pokémon within the team's array
    const pokemonIndex = team.pokemon.findIndex(
      (p) => p._id && pokemonId === p._id.toString()
    );
    if (pokemonIndex === -1) {
      throw new Error("Pokemon not found in team");
    }

    // Update only changed properties
    Object.assign(team.pokemon[pokemonIndex], newPokemon);
    await team.save();

    // get update pokemon with all ability and move information in one pipeline instead of separate queries
    const result = await TeamModel.aggregate([

      { $match: { _id: team._id } },
      // Unwind the pokemon array so we can work on individual entries
      { $unwind: "$pokemon" },
      // Match the specific Pokémon by _id
      { $match: { "pokemon._id": team.pokemon[pokemonIndex]._id } },

      {
        $lookup: {
          from: "moves",
          localField: "pokemon.moves",
          foreignField: "_id",
          as: "pokemon.moves",
        },
      },
      // Lookup ability (assuming the abilities collection name is "abilities")
      {
        $lookup: {
          from: "abilities",
          localField: "pokemon.ability",
          foreignField: "_id",
          as: "pokemon.ability",
        },
      },
      // If ability is a single object, unwind it while preserving empty arrays
      {
        $unwind: {
          path: "$pokemon.ability",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Replace the root with the pokemon object so we return it directly
      { $replaceRoot: { newRoot: "$pokemon" } },
    ]);

    if (!result || result.length === 0) {
      throw new Error("Updated Pokemon not found");
    }

    console.log("result is ", result[0])

    return result[0] as Pokemon;
  }

  async deleteTeam(teamId: string) {
    await TeamModel.deleteOne({ _id: teamId })
    return teamId
  }

  async editTeam(team: Partial<Team>): Promise<Team | null> {
    const updatedTeam = await TeamModel.findOneAndUpdate(
      { _id: team._id },
      { $set: { name: team.name } },
      { new: true, runValidators: true }

    );

    if (!updatedTeam) {
      throw new Error("no team exists")
    }
    return updatedTeam?.toObject()
  }

  async getTeam(teamId: string): Promise<Team> {
    
    const team = await TeamModel.findById(teamId)
    if (!team) {
      throw new Error("team doesnt exist")
    }
    return team?.toObject();
  }


  async checkPokemonLegal(pokemon: Partial<Pokemon>): Promise<boolean> {


    const species = await PokemonSpeciesModel.findById(pokemon.pokemonSpecies).lean().exec()


    if (pokemon.moves) {
      if(!this.checkMovesLegal(pokemon.moves,species)) {
        return false
      }
    }
    if(pokemon.ability) {
      if(!this.checkAbilityLegal(pokemon.ability,species)){
        return false
      }
    }

    return true


  }

  checkAbilityLegal(ability:Ref<Ability> | Ability, species:any):boolean {
    return species.abilities.some((x: { _id: { toString: () => string; }; })=> x._id?.toString() === ability.toString())
  }

  checkMovesLegal(moves: Ref<Move>[] | Move[], species:any): boolean {

    const uniqueMoves = new Set()

    for (const move of moves) {
      // check unlearnable moves

      const findMove = species?.learnableMoves.some((m: { _id: { toString: () => string; }; }) => m._id?.toString() == move.toString())
      if (!findMove) {
        return false
      }
      // check duplicates
      if (uniqueMoves.has(move)) {
        return false
      }
      uniqueMoves.add(move)
    }

    return true

  }




}

export async function getTeamWithAllPokemonInfo(id:string):Promise<any> {

  const result = await TeamModel.aggregate([

    { $match: { _id: new Types.ObjectId(id) } },

    { $unwind: "$pokemon" },

    {
      $lookup: {
        from: "moves",
        localField: "pokemon.moves",
        foreignField: "_id",
        as: "pokemon.moves",
      },
    },
    { $unwind: "$pokemon" },

    {
      $lookup: {
        from: "abilities",
        localField: "pokemon.ability",
        foreignField: "_id",
        as: "pokemon.ability",
      },
    },

    {
      $unwind: {
        path: "$pokemon.ability",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "pokemonspecies",
        localField: "pokemon.pokemonSpecies",
        foreignField: "_id",
        as: "pokemon.pokemonSpecies",
      },
    },
    {
      $unwind: {
        path: "$pokemon.pokemonSpecies",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        pokemon: { $push: "$pokemon" },
      },
    },
    
  ]);
  
  if (!result || result.length === 0) {
    throw new Error("team not found");
  }
  return result[0]
}


export function calculatePokemonStat(isHp:boolean,level:number,iv:number,ev:number,base:number, nature:string):number {

  const evValue = Math.floor(ev/4)
  const numerator = Math.floor((2*base+evValue)*level/100)

  if(isHp) {

    const statValue = numerator + level + 10
    return statValue
  }
  else {
    const statValue = (numerator+5) * 1    
    return statValue
  }

}