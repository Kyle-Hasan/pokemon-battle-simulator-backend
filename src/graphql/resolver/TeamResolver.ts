import { Resolver, Query, Arg, Int, Info, Mutation } from "type-graphql";
import { Team } from "../../models/Team";
import { TeamService } from "../../database/TeamService";
import {UserService} from '../../database/UserService'
import { Pokemon } from "../types/Pokemon";
import {Pokemon as PokemonDb} from "../../models/Pokemon"
import mongoose, { ObjectId } from "mongoose";

@Resolver(()=>Team)
export class TeamResolver {
    teamService: TeamService;
    userService: UserService;

    constructor(){
        this.teamService = new TeamService();
        this.userService = new UserService();
    }

    @Mutation(_returns => Team)
    async blankTeam(@Arg("userId") userId:string) {
        return  await this.teamService.blankTeam(userId)
    }

    @Mutation(_returns => Team)
    async addPokemon( @Arg("teamId") teamId:string,  @Arg("pokemon") pokemon:Partial<Pokemon> ) {
        const dbPokemon: Partial<PokemonDb> = {
            ...pokemon,
            pokemonSpecies:new mongoose.Types.ObjectId(pokemon.pokemonSpecies?._id)
           
        };
        return await this.teamService.addPokemon(dbPokemon, teamId)
    }

    @Mutation(_returns => Team)
    async deletePokemon( @Arg("teamId") teamId:string,  @Arg("pokemonId") pokemonId:string) {
        
        return await this.teamService.deletePokemon(pokemonId,teamId)
    }

    @Mutation(_returns => Team)
    async editPokemon( @Arg("teamId") teamId:string,  @Arg("pokemonId") pokemonId:string, @Arg("pokemon") pokemon:Partial<Pokemon>) {

        const dbPokemon: Partial<PokemonDb> = {
            ...pokemon,
            pokemonSpecies:new mongoose.Types.ObjectId(pokemon.pokemonSpecies?._id)
           
        };
        
        return await this.teamService.editPokemon(pokemonId,dbPokemon,teamId)
    }

     @Query(() => [Team])
     async getAllUserTeams(@Arg("userId") userId:string) {

        return await this.userService.getAllUserTeams(userId)

     }

   




}