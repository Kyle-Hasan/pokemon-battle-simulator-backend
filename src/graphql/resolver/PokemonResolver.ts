import { Resolver, FieldResolver, Root } from "type-graphql";
import { PokemonSpecies, PokemonSpeciesModel } from "../../models/PokemonSpecies";
import { Pokemon } from "../../models/Pokemon";
import { getPokemonAndMoves } from "../../database/PokemonSpeciesService";
import { Move } from "../../models/Move";
import { Ability } from "../../models/Ability";
import { Types } from "mongoose";


@Resolver(() => Pokemon)
export class PokemonResolver {
  @FieldResolver(() => PokemonSpecies)
  async pokemonSpecies(@Root() pokemon: Pokemon): Promise<PokemonSpecies | null> {
    // if its an object, assume its already been filled in
  
    if(!(pokemon.pokemonSpecies instanceof Types.ObjectId)) {
      return pokemon.pokemonSpecies as PokemonSpecies
    }
    console.log("resolving qekw[",pokemon.pokemonSpecies.toString())
    const species =   await getPokemonAndMoves(pokemon.pokemonSpecies.toString(),{})
    console.log(" species", species)
    return species
  }
  
}
