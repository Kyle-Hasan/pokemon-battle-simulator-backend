

import { Types } from "mongoose";
import { Pokemon } from "../models/Pokemon";
import { Team, TeamModel } from "../models/Team"
import { UserModel } from "../models/User";
import { error } from "console";

export class TeamService {
    async blankTeam(userId:string):Promise<Team> {

        let newTeam:Team = { pokemon: [] };

        const savedTeam = (await TeamModel.insertOne(newTeam));

        const user = await UserModel.findById(userId)

        user?.teams.push(savedTeam._id)

        await user?.save()


        return savedTeam.toObject()


    }

    async addPokemon(pokemon:Partial<Pokemon>,teamId:string):Promise<Team> {

        const team = await TeamModel.findById(teamId)
        if(!team || team.pokemon && team?.pokemon?.length >= 6) {
            throw new Error("teams can only have 6 pokemon")
        }
        
      
        team?.pokemon?.push({
            nickname: pokemon.nickname,
            pokemonSpecies: pokemon.pokemonSpecies ? pokemon.pokemonSpecies : "", // Convert to ObjectId
          });

        await team.save()

        return team.toObject()



    }

    async deletePokemon(pokemonId:string,teamId:string):Promise<Team> {

        const team = await TeamModel.findById(teamId)

        if(team?.pokemon == null) {
            throw new Error("This team has no pokemon")
        }
       
        
        const pokemon = team?.pokemon?.filter(x=> x?._id && pokemonId !== x._id.toString())
        team.pokemon = pokemon
        await team?.save()

        return team.toObject()

    }

    async editPokemon(pokemonId:string,newPokemon:Partial<Pokemon>,teamId:string):Promise<Team> {

        const team = await TeamModel.findById(teamId)

        if(team?.pokemon == null) {
            throw new Error("This team has no pokemon")
        }
       
        
        const oldPokemonIndex = team?.pokemon?.findIndex(x=> x?._id && pokemonId === x._id.toString())
        team.pokemon[oldPokemonIndex] = newPokemon as Pokemon
        await team?.save()

        return team.toObject()

    }

    async deleteTeam(teamId:string) {
        await TeamModel.deleteOne({_id:teamId})
    }

    async editTeam(team:Partial<Team>):Promise<Team | null> {
        const updatedTeam = await TeamModel.findOneAndUpdate(
            { _id: team._id },
            { $set: { name: team.name } },
            {new:true,runValidators:true}
           
          );
          
        if(!updatedTeam) {
            throw new Error("no team exists")
        }
        return updatedTeam?.toObject()
    }

    
}