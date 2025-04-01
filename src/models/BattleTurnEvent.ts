import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { PokemonInBattle } from "./PokemonInBattle";
import { Environment } from "./Environment";
import { Move } from "./Move";

// Enum for all possible battle event types
export enum BattleEventType {
    Move = "MOVE",
    Damage = "DAMAGE",
    Status = "STATUS",
    Environment = "ENVIRONMENT",
    Switch_In = "SWITCH_OUT",
    Switch_Out = "SWITCH_IN",
    Faint = "FAINT",
    Crit = "CRIT",
    Super_Effective = "SUPER_EFFECTIVE",
    Tailwind = "TAILWIND",
    Trick_Room = "TRICK_ROOM",
    Missed = "MISSED",
    Evaded = "EVADED",
    Ineffective = 'INEFFECTIVE',
    Immune = 'IMMUNE'
  }
  
  registerEnumType(BattleEventType, {
    name: "BattleEventType",
  });
  
  
  
  @ObjectType()
  export class BattleTurnEvent {
    @Field(() => BattleEventType)
    type!: BattleEventType;
  
    
    @Field(() => String, { nullable: true })
    message?: string;
  
  
    @Field(() => Number, { nullable: true })
    damage?: number;
  
   
    @Field(() => Boolean, { nullable: true })
    crit?: boolean;
  
    @Field(() => Boolean, { nullable: true })
    superEffective?: boolean;
  
    @Field(() => PokemonInBattle, { nullable: true })
    pokemon?: PokemonInBattle;
  
  
    @Field(() => Environment, { nullable: true })
    environment?: Environment;
  
  
    @Field(() => Move, { nullable: true })
    moveUsed?: Move;
    
    @Field(() => PokemonInBattle, { nullable: true })
    leavingPokemon?: PokemonInBattle;
  
    
    @Field(() => PokemonInBattle, { nullable: true })
    enteringPokemon?: PokemonInBattle;
  }