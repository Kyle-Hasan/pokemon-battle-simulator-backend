import { Field, ID, ObjectType } from "type-graphql";
import { Environment } from "./Environment";
import { BattleTeam } from "./BattleTeam";
import { PlayerInfo } from "./Player";
import { BattleTurnEvent } from "./BattleTurnEvent";

@ObjectType()
export class Battle {
  @Field(() => String)
  id!: string;

  @Field(() => [BattleTeam])
  teams:BattleTeam[] = []


  
  

  @Field(() => Environment)
  environment!: Environment;



  @Field(()=> Number)
  turnNumber!:number;

  @Field(()=> [BattleTurnEvent])
  events!:BattleTurnEvent[];


}