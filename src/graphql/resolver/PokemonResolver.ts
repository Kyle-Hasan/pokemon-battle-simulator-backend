import { Resolver, FieldResolver, Root } from "type-graphql";
import { PokemonSpecies, PokemonSpeciesModel } from "../../models/PokemonSpecies";
import { Pokemon } from "../../models/Pokemon";
import { getPokemonAndMoves } from "../../database/PokemonSpeciesService";
import { Move } from "../../models/Move";
import { Ability } from "../../models/Ability";


@Resolver(() => Pokemon)
export class PokemonResolver {
  @FieldResolver(() => PokemonSpecies)
  async pokemonSpecies(@Root() pokemon: Pokemon): Promise<PokemonSpecies | null> {
    console.log("resolving qekw[",pokemon.pokemonSpecies.toString())
    const species =   await getPokemonAndMoves(pokemon.pokemonSpecies.toString(),{})
    console.log(" species", species)
    return species
  }
  
}
