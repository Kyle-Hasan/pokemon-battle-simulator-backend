import { Field, ID, ObjectType } from "type-graphql";
import { PokemonUpdate } from "./PokemonUpdate";
import { Environment } from "./Environment";
import { PokemonInBattle } from "./PokemonInBattle";
import { BattleTeam } from "./BattleTeam";
import { Move } from "./Move";

import { Int, registerEnumType } from "type-graphql";
import { BattleTurnEvent } from "./BattleTurnEvent";




@ObjectType()
export class BattleUpdatePlayer {
  @Field(() => String)
  battleId!: string;


  @Field(() => [BattleTurnEvent])
  events!: BattleTurnEvent[];

 
  @Field(() => Int)
  turnNumber!: number;
}
