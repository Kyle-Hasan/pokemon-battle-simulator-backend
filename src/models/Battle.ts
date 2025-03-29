import { Field, ID, ObjectType } from "type-graphql";
import { Environment } from "./Environment";
import { BattleTeam } from "./BattleTeam";
import { PlayerInfo } from "./Player";

@ObjectType()
export class Battle {
  @Field(() => String)
  id!: string;

  @Field(() => BattleTeam)
  team1!: BattleTeam;

  @Field(() => BattleTeam)
  team2!: BattleTeam;


  @Field(()=> Boolean)
  team1FreeSwitch!: boolean;

  @Field(()=> Boolean)
  team2FreeSwitch!: boolean;
  

  @Field(() => Environment)
  environment!: Environment;



  @Field(()=> PlayerInfo)
  player1Info!:PlayerInfo;

  @Field(()=>PlayerInfo)
  player2Info!:PlayerInfo;

  

  @Field(()=> Number)
  turnNumber!:number;


}