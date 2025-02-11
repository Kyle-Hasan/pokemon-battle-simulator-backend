import { ObjectId } from "mongoose";
import { PokemonSpecies, PokemonSpeciesModel } from "../models/PokemonSpecies";


export class PokemonSpeciesService {

    async getPokemonAndMoves(id:ObjectId | string, filter:Record<string, number>): Promise<PokemonSpecies | null> {
        const pokemonSpecies = await PokemonSpeciesModel.findById(id,filter).populate('learnableMoves').populate('abilities').exec()
        
        return pokemonSpecies
    }

    async getAllPokemonAndMoves(filter:Record<string, number>):Promise<any[] | null> {


        const pokemonSpeciesArr = await PokemonSpeciesModel.aggregate([
            
            {
              $lookup: {
                from: "moves",
                localField: "learnableMoves",
                foreignField: "_id",
                as: "learnableMoves"
              }
            },
            {
              $lookup: {
                from: "abilities",
                localField: "abilities",
                foreignField: "_id",
                as: "abilities"
              }
            }
          ])

        .exec()
        
        
        return pokemonSpeciesArr

    }

    

}