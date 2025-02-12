import { Resolver, Query, Arg, Int, Info, Mutation } from "type-graphql";

import { TeamService } from "../../database/TeamService";
import {UserService} from '../../database/UserService'

import {AddPokemonInput, Pokemon} from "../../models/Pokemon"
import mongoose, { ObjectId, Types } from "mongoose";

import {AddTeamInput, Team} from '../../models/Team'
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
    async addPokemon( @Arg("teamId") teamId:string,  @Arg("pokemon", ()=>AddPokemonInput) pokemon:AddPokemonInput ) {

        pokemon.pokemonSpecies = new Types.ObjectId(pokemon.pokemonSpecies.toString());
        
        return await this.teamService.addPokemon(pokemon, teamId)
    }

    @Mutation(_returns => Team)
    async deletePokemon( @Arg("teamId") teamId:string,  @Arg("pokemonId") pokemonId:string) {
        
        return await this.teamService.deletePokemon(pokemonId,teamId)
    }

    @Mutation(_returns => Team)
    async editPokemon( @Arg("teamId") teamId:string,  @Arg("pokemonId") pokemonId:string, @Arg("pokemon", ()=>AddPokemonInput) pokemon:Partial<AddPokemonInput>) {

        
        
        return await this.teamService.editPokemon(pokemonId,pokemon,teamId)
    }

    @Query(() => [Team]) 
    async getAllUserTeams(@Arg("userId") userId: string): Promise<Team[]> {
      const teams = await this.userService.getAllUserTeams(userId);
      return teams
    }

     @Mutation(_returns => Team)
    async editTeam( @Arg("team",()=>AddTeamInput) team:AddTeamInput) {

        
        const teamNew =  await this.teamService.editTeam(team)
        console.log(teamNew)
        return teamNew
    }

    @Mutation(_returns => Boolean)
    async deleteTeam( @Arg("teamId") teamId:string) {
        

        await this.teamService.deleteTeam(teamId)
        return true
    }

   




}