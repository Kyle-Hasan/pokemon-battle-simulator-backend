import fetch from 'node-fetch';
import { connectDB } from "./database";
import {Move, MoveModel} from './models/Move'
import {AbilityModel} from './models/Ability'
import {PokemonSpecies, PokemonSpeciesModel} from './models/PokemonSpecies'
import {Stats} from './models/Stats'
import {PP} from './models/PP'
connectDB()


export const addPokemon = async()=> {
console.log("run function")
const pokemon = ["tepig","oshawott","snivy"]
const baseUrl = 'https://pokeapi.co/api/v2/pokemon'

for(let i = 0; i < pokemon.length;i++) {
    const p = pokemon[i]
    console.log(p)
    const fullUrl = `${baseUrl}/${p}`
    console.log("full url "+ fullUrl)
    try {
    const retrievedPokemon = await fetch(fullUrl)
    const retrievedPokemonJson:any = await retrievedPokemon.json()
   // console.log("pokemon is " , retrievedPokemonJson)
    const movesArr:any[] = retrievedPokemonJson.moves
    const movesToAdd = []
    for(const m of movesArr ) {
        //console.log("move",m)
        //@ts-ignore
        
        const mReformat = m.move.name.replace("-"," ").toLowerCase()
        const existingMove = await MoveModel.findOne({ name: { $regex: mReformat, $options: "i" } })
        if(existingMove) {
            movesToAdd.push(existingMove._id)
        }
    }
    const abilitiesArr:any[] = retrievedPokemonJson.abilities
    const abilitiesToAdd = []
    for(const a of abilitiesArr ) {
       // console.log("ability is ", a)
        //@ts-ignore
        const mReformat = a.ability.name.replace("-"," ").toLowerCase()
        const existingAbility = await AbilityModel.findOne({ name: { $regex: mReformat, $options: "i" } })
        if(existingAbility) {
            abilitiesToAdd.push(existingAbility._id)
        }

    }

    const newPokemon:PokemonSpecies = {
        name:retrievedPokemonJson.name,
        menuSprite:retrievedPokemonJson.name+"placeholder",
        teamBuilderSprite:retrievedPokemonJson+"placeholder",
        battleSprite:retrievedPokemonJson.sprites.front_default,
        learnableMoves:movesToAdd,
        abilities:abilitiesToAdd,
        baseStats: {
           
           hp: retrievedPokemonJson.stats.find((x: { stat: { name: string; }; })=> x.stat.name === "hp").base_stat,
           attack: retrievedPokemonJson.stats.find((x: { stat: { name: string; }; })=> x.stat.name === "attack").base_stat,
           defense: retrievedPokemonJson.stats.find((x: { stat: { name: string; }; })=> x.stat.name === "defense").base_stat,
           specialAttack: retrievedPokemonJson.stats.find((x: { stat: { name: string; }; })=> x.stat.name === "special-attack").base_stat,
           specialDefense: retrievedPokemonJson.stats.find((x: { stat: { name: string; }; })=> x.stat.name === "special-defense").base_stat,
           speed: retrievedPokemonJson.stats.find((x: { stat: { name: string; }; })=> x.stat.name === "speed").base_stat,


        }
    }
    console.log("new pokemon",newPokemon)
    await PokemonSpeciesModel.create(newPokemon)
    console.log("added pokemon")
}
catch(e) {
    console.log(e)
}

}

}


addPokemon()