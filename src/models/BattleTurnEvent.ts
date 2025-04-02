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
    Immune = 'IMMUNE',
    Win = "WIN",
  }
  
  registerEnumType(BattleEventType, {
    name: "BattleEventType",
  });
  
  
  
  @ObjectType()
  export class BattleTurnEvent {
    @Field(() => BattleEventType, { name: "type" })
    protected _type!: BattleEventType;
  
    @Field(() => String, { nullable: true, name: "message" })
    protected _message?: string;
  
    @Field(() => Number, { nullable: true, name: "damage" })
    protected _damage?: number;
  
    @Field(() => Boolean, { nullable: true, name: "crit" })
    protected _crit?: boolean;
  
    @Field(() => Boolean, { nullable: true, name: "superEffective" })
    protected _superEffective?: boolean;
  
    @Field(() => PokemonInBattle, { nullable: true, name: "pokemon" })
    protected _pokemon?: PokemonInBattle;
  
    @Field(() => Environment, { nullable: true, name: "environment" })
    protected _environment?: Environment;
  
    @Field(() => Move, { nullable: true, name: "moveUsed" })
    protected _moveUsed?: Move;
  
    @Field(() => PokemonInBattle, { nullable: true, name: "leavingPokemon" })
    protected _leavingPokemon?: PokemonInBattle;
  
    @Field(() => PokemonInBattle, { nullable: true, name: "enteringPokemon" })
    protected _enteringPokemon?: PokemonInBattle;
  
    @Field(() => String, { name: "userId" })
    protected _userId!: string;
  
    constructor(init?: Partial<BattleTurnEvent>) {
      Object.assign(this, init);
    }
  
    get type(): BattleEventType {
      return this._type;
    }
    set type(value: BattleEventType) {
      this._type = value;
    }
  
    get message(): string | undefined {
      return this._message;
    }
    set message(value: string | undefined) {
      this._message = value;
    }
  
    get damage(): number | undefined {
      return this._damage;
    }
    set damage(value: number | undefined) {
      this._damage = value;
    }
  
    get crit(): boolean | undefined {
      return this._crit;
    }
    set crit(value: boolean | undefined) {
      this._crit = value;
    }
  
    get superEffective(): boolean | undefined {
      return this._superEffective;
    }
    set superEffective(value: boolean | undefined) {
      this._superEffective = value;
    }
  
    get pokemon(): PokemonInBattle | undefined {
      return this._pokemon;
    }
    set pokemon(value: PokemonInBattle | undefined) {
      this._pokemon = value;
    }
  
    get environment(): Environment | undefined {
      return this._environment;
    }
    set environment(value: Environment | undefined) {
      this._environment = value;
    }
  
    get moveUsed(): Move | undefined {
      return this._moveUsed;
    }
    set moveUsed(value: Move | undefined) {
      this._moveUsed = value;
    }
  
    get leavingPokemon(): PokemonInBattle | undefined {
      return this._leavingPokemon;
    }
    set leavingPokemon(value: PokemonInBattle | undefined) {
      this._leavingPokemon = value;
    }
  
    get enteringPokemon(): PokemonInBattle | undefined {
      return this._enteringPokemon;
    }
    set enteringPokemon(value: PokemonInBattle | undefined) {
      this._enteringPokemon = value;
    }
  
    get userId(): string {
      return this._userId;
    }
    set userId(value: string) {
      this._userId = value;
    }
  }