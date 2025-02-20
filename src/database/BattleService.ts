import { Battle } from "../models/Battle";
import { Environment } from "../models/Environment";
import { PokemonInBattle } from "../models/PokemonInBattle";
import { TeamModel } from "../models/Team";
import { getTeamWithAllPokemonInfo } from "./TeamService";


export class BattleService {
    battleMap: Map<string, Battle>;

    constructor() {
        this.battleMap = new Map()
    }

    async newBattle() {

     

         const team1  = await getTeamWithAllPokemonInfo("67b6a6d11eaed2e8f708c361")
         
         const team2 = await getTeamWithAllPokemonInfo("67b6a83a1760cc59c36f1a94")
         
         const teams = [team1,team2]
         

         const pokemonInBattleArr:PokemonInBattle[][] = [[],[]]

         for(let i = 0; i < teams.length; i++) {
            const team = teams[i]
            const pokeArr = pokemonInBattleArr[i]
            if (team && team.pokemon) {
                for(const pokemon of team.pokemon) {
                    const newPokemonInBattle = new PokemonInBattle()

                    newPokemonInBattle.pokemon = pokemon
                    newPokemonInBattle.isActive = false
                 
                    newPokemonInBattle.remainingHealth = pokemon.pokemonSpecies.baseStats.hp;
                    newPokemonInBattle.statStages = {hp:1,attack:1,defense:1,specialDefense:1,specialAttack:1,speed:1}
                    newPokemonInBattle.status = {}
                
                    pokeArr.push(newPokemonInBattle)


                }
            }
         }

         const environment:Environment = {}

         const battle = new Battle()
         battle.environment = environment
         battle.team1 = pokemonInBattleArr[0]
         battle.team2 = pokemonInBattleArr[1]
         battle.id = "1"
         this.battleMap.set("1",battle)  
         return battle




         
    }


    




    


}