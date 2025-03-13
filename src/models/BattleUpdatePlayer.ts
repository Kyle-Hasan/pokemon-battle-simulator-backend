import { Field, ID, ObjectType } from "type-graphql";
import { PokemonUpdate } from "./PokemonUpdate";
import { Environment } from "./Environment";
import { PokemonInBattle } from "./PokemonInBattle";
import { BattleTeam } from "./BattleTeam";
import { Move } from "./Move";

@ObjectType()
export class BattleUpdatePlayer {

  @Field(() => ID)
  battleId!: string;

  @Field(() => [PokemonInBattle])
  changedPlayerPokemon!: PokemonInBattle[];

  @Field(() => [PokemonInBattle])
  changedEnemyPokemon!: PokemonInBattle[];

  @Field(() => Environment)
  environment!: Environment;

  @Field(()=> Boolean)
  movedFirst!: boolean;

  // pokemon handle fainted
  @Field(()=> Boolean)
  playerFreeSwitch!: boolean;

  @Field(()=> Boolean)
  enemyFreeSwitch!: boolean;

  @Field(()=> Number, {nullable: true})
  playerDamage?: number;

  @Field(()=> Number, {nullable: true})
  enemyDamage?: number;

  // null for switch
  @Field(()=>Move, {nullable: true})
  playerMoveUsed!: Move | null;

  @Field(()=>Move, {nullable: true})
  enemyMoveUsed!: Move | null;

  @Field(()=> Boolean, {nullable: true})
  playerLost!: boolean | null;

  @Field(()=> Boolean, {nullable: true})
  enemyLost!: boolean | null;

  @Field(()=> Number)
  turnNumber!:number


  
  
  
}


export class BattleUpdate {
  battleId!: string;
  playerOneChangedPokemon!: BattleTeam;
  playerTwoChangedPokemon!: BattleTeam;
  environment!: Environment;
  playerOneMovedFirst!: boolean;
  playerOneFreeSwitch!: boolean;
  playerTwoFreeSwitch!: boolean;
  playerOneMoveUsed!: Move | null;
  playerTwoMoveUsed!: Move | null;
  playerOneDamage?: number;
  playerTwoDamage?: number;
  playerOneLoss?: boolean;
  playerTwoLoss?: boolean;
  turnNumber!:number;

}