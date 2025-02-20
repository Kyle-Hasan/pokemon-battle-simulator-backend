import { Field, ID, ObjectType } from "type-graphql";
import { Environment } from "./Environment";
import { PokemonInBattle } from "./PokemonInBattle";

@ObjectType()
export class Battle {
  @Field(() => ID)
  id!: string;

  @Field(() => [PokemonInBattle])
  team1!: PokemonInBattle[];

  @Field(() => [PokemonInBattle])
  team2!: PokemonInBattle[];

  @Field(() => Environment)
  environment!: Environment;
}