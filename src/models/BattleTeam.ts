import { Field, ID, InputType, ObjectType } from "type-graphql";
import { PokemonInBattle } from "./PokemonInBattle";
import { PlayerInfo } from "./Player";

@ObjectType()
export class BattleTeam {

  @Field(() => [PokemonInBattle])
  pokemonInBattle !:PokemonInBattle[];

  
  @Field(()=> Number)
  totalPokemon!: number;

  userId!:string;

  @Field(()=> PlayerInfo)
  playerInfo!:PlayerInfo;

  @Field(()=> Boolean)
  freeSwitch !:boolean





}
