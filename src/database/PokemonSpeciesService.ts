import { ObjectId, Types } from "mongoose";
import { PokemonSpecies, PokemonSpeciesModel } from "../models/PokemonSpecies";




export async function getPokemonAndMoves(id: ObjectId | string, filter: Record<string, number>): Promise<PokemonSpecies | null> {
  // Convert id to ObjectId if it's a string
  const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id


  const results = await PokemonSpeciesModel.aggregate([
    {
      $match: { _id: objectId }
    },
    {
      $lookup: {
        from: 'moves',
        localField: 'learnableMoves',
        foreignField: '_id',
        as: 'learnableMoves'
      }
    },
    {
      $lookup: {
        from: 'abilities',
        localField: 'abilities',
        foreignField: '_id',
        as: 'abilities'
      }
    }
  ])

  console.log('pokemon species', results)

  if (!results || results.length === 0) {
    return null
  }

  // The aggregation returns plain objects, so no need to call .toObject()
  return results[0]
}



export async function getAllPokemonAndMoves(filter: Record<string, number>): Promise<any[] | null> {


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


