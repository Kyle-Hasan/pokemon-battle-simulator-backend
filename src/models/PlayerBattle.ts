import { Field, ID, ObjectType } from "type-graphql";
import { Environment } from "./Environment";
import { BattleTeam } from "./BattleTeam";
import { PlayerInfo } from "./Player";
// battle from the perspective of the player
// the player has a team of pokemon
// the player can switch pokemon

@ObjectType()
export class PlayerBattle {
  @Field(() => ID)
  battleId!: string;

  @Field(() => BattleTeam)
  playerTeam!: BattleTeam;

  @Field(() => BattleTeam)
  enemyTeam!: BattleTeam;


  @Field(()=> Boolean)
  playerSwitch!: boolean;

  @Field(()=> Boolean)
  enemySwitch!: boolean;

  @Field(() => Environment)
  environment!: Environment;

  @Field(()=> Number)
  turnNumber!:number;

   @Field(()=> PlayerInfo)
    player1Info!:PlayerInfo;
  
    @Field(()=>PlayerInfo)
    player2Info!:PlayerInfo;






}