import { Field, ID, InputType, ObjectType } from "type-graphql";
import { PokemonInBattle } from "./PokemonInBattle";

@ObjectType()
export class BattleTeam {

 @Field(() => [PokemonInBattle])
  pokemonInBattle !:PokemonInBattle[];

  
  @Field(()=> Number)
  totalPokemon!: number;





}
