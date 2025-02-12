import { Resolver, FieldResolver, Root } from "type-graphql";
import { PokemonSpecies, PokemonSpeciesModel } from "../../models/PokemonSpecies";
import { Pokemon } from "../../models/Pokemon";


@Resolver(() => Pokemon)
export class PokemonResolver {
  @FieldResolver(() => PokemonSpecies)
  async pokemonSpecies(@Root() pokemon: Pokemon): Promise<PokemonSpecies | null> {
    return await PokemonSpeciesModel.findById(pokemon.pokemonSpecies);
  }
}
