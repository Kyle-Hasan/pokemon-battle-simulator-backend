import { Field, ID, ObjectType } from "type-graphql";
import { PokemonUpdate } from "./PokemonUpdate";
import { Environment } from "./Environment";

@ObjectType()
export class BattleUpdate {

  @Field(() => ID)
  battleId!: string;

  @Field(() => [PokemonUpdate])
  changedAllyPokemon!: PokemonUpdate[];

  @Field(() => [PokemonUpdate])
  changedEnemyPokemon!: PokemonUpdate[];

  @Field(() => Environment)
  environment!: Environment;
}