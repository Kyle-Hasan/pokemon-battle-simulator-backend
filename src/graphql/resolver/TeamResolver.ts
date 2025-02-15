import { Resolver, Query, Arg, Int, Info, Mutation } from "type-graphql";

import { TeamService } from "../../database/TeamService";
import {UserService} from '../../database/UserService'

import {AddPokemonInput, Pokemon} from "../../models/Pokemon"
import mongoose, { ObjectId, Types } from "mongoose";

import {AddTeamInput, Team} from '../../models/Team'
import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";
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

    @Mutation(_returns => Pokemon)
    async addPokemon( @Arg("teamId") teamId:string,  @Arg("pokemon", ()=>AddPokemonInput) pokemon:AddPokemonInput ) {

        pokemon.pokemonSpecies = new Types.ObjectId(pokemon.pokemonSpecies.toString());
        
        const newPokemon =  await this.teamService.addPokemon(pokemon, teamId)
       
        return newPokemon
    }

    @Mutation(_returns => Team)
    async deletePokemon( @Arg("teamId") teamId:string,  @Arg("pokemonId") pokemonId:string) {
        
        return await this.teamService.deletePokemon(pokemonId,teamId)
    }

    @Mutation(_returns => Pokemon)
    async editPokemon( @Arg("teamId") teamId:string,  @Arg("pokemonId") pokemonId:string, @Arg("pokemon", ()=>AddPokemonInput) pokemon:Partial<AddPokemonInput>) {

        
        console.log(" pokemon ",pokemon)
        return await this.teamService.editPokemon(pokemonId,pokemon,teamId)
    }

    @Query(() => [Team]) 
    async getAllUserTeams(@Arg("userId") userId: string): Promise<Team[]> {
      const teams = (await this.userService.getAllUserTeams(userId)).filter(x=> x.name !== "" && x.pokemon && x.pokemon?.length > 0);
      return teams
    }

     @Mutation(_returns => Team)
    async editTeam( @Arg("team",()=>AddTeamInput) team:AddTeamInput) {

        
        const teamNew =  await this.teamService.editTeam(team)
        
        return teamNew
    }

    @Mutation(_returns => Boolean)
    async deleteTeam( @Arg("teamId") teamId:string) {
        

        await this.teamService.deleteTeam(teamId)
        return true
    }

    @Query(() =>Team) 
    async getTeam(
        @Arg("teamId", () => String, { nullable: false }) id: string,
        @Info() info: GraphQLResolveInfo
      ): Promise<Team> {
        const fields = graphqlFields(info);
        return await this.teamService.getTeam(id)
      }
   




}