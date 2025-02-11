import { Resolver, Query, Arg, Int, Info } from "type-graphql";
import { PokemonSpecies } from "../types/PokemonSpecies";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { PokemonSpeciesModel } from "../../models/PokemonSpecies";
import { PokemonSpeciesService } from "../../database/PokemonSpeciesService";

@Resolver(() => PokemonSpecies)
export class PokemonSpeciesResolver {
  pokemonSpeciesService: PokemonSpeciesService;

  constructor() {
    this.pokemonSpeciesService = new PokemonSpeciesService();
    
  }

  @Query(() => PokemonSpecies, { nullable: true })
  async pokemonSpecies(
    @Info() info: GraphQLResolveInfo
  ): Promise<PokemonSpecies | null> {
    const fields = graphqlFields(info);
    const projection = Object.keys(fields).reduce((proj, key) => {
      proj[key] = 1;
      return proj;
    }, {} as Record<string, number>);

    const filter: any = {};
   

    const species = await PokemonSpeciesModel.findOne(filter, projection).lean().exec();
    
    if (species && species._id) {
      //@ts-ignore
      species._id = species._id.toString();
    }
    //@ts-ignore
    return species;
  }

  @Query(() => [PokemonSpecies])
  async allPokemon(
    @Arg("ids", () => [String], { nullable: true }) ids: string[] | undefined,
    @Info() info: GraphQLResolveInfo
  ): Promise<PokemonSpecies[]> {
    const fields = graphqlFields(info);
    const projection = Object.keys(fields).reduce((proj, key) => {
      proj[key] = 1;
      return proj;
    }, {} as Record<string, number>);

    

    const speciesList:PokemonSpecies[] | null = (await this.pokemonSpeciesService.getAllPokemonAndMoves({})) as PokemonSpecies[] | null; 

    if(!speciesList) {
      return []
    }

    
    
    return speciesList;
  }
}