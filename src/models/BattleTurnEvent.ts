import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { PokemonInBattle } from "./PokemonInBattle";
import { Move } from "./Move";
import { Environment } from "./Environment";

export enum BattleEventType {
  MOVE = "MOVE",
  DAMAGE = "DAMAGE",
  STATUS = "STATUS",
  ENVIRONMENT = "ENVIRONMENT",
  SWITCH_IN = "SWITCH_OUT",
  SWITCH_OUT = "SWITCH_IN",
  FAINT = "FAINT",
  CRIT = "CRIT",
  SUPER_EFFECTIVE = "SUPER_EFFECTIVE",
  TAILWIND = "TAILWIND",
  TRICK_ROOM = "TRICK_ROOM",
  MISSED = "MISSED",
  EVADED = "EVADED",
  INEFFECTIVE = "INEFFECTIVE",
  IMMUNE = "IMMUNE",
  WIN = "WIN",
  ATTACK = "ATTACK",
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

  @Field(() => String, { nullable: false, name: "pokemonId" })
  protected _pokemonId!: string;

  @Field(() => String, { nullable: true, name: "leavingPokemonId" })
  protected _leavingPokemonId?: string;

  @Field(() => PokemonInBattle, { nullable: true, name: "enteringPokemon" })
  protected _enteringPokemon?: PokemonInBattle;

  @Field(() => Move, { nullable: true, name: "moveUsed" })
  protected _moveUsed?: Move;

  @Field(() => Environment, { nullable: true, name: "environment" })
  protected _environment?: Environment;

  @Field(() => String, { name: "userId" })
  protected _userId!: string;

  @Field(() => Int, { name: "turnNumber" })
  protected _turnNumber!: number;

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

  get pokemonId(): string {
    return this._pokemonId;
  }
  set pokemonId(value: string) {
    this._pokemonId = value;
  }

  get leavingPokemonId(): string | undefined {
    return this._leavingPokemonId;
  }
  set leavingPokemonId(value: string | undefined) {
    this._leavingPokemonId = value;
  }

  get enteringPokemon(): PokemonInBattle | undefined {
    return this._enteringPokemon;
  }
  set enteringPokemon(value: PokemonInBattle | undefined) {
    this._enteringPokemon = value;
  }

  get moveUsed(): Move | undefined {
    return this._moveUsed;
  }
  set moveUsed(value: Move | undefined) {
    this._moveUsed = value;
  }

  get environment(): Environment | undefined {
    return this._environment;
  }
  set environment(value: Environment | undefined) {
    this._environment = value;
  }

  get turnNumber():number {
    return this._turnNumber;
  }

  set turnNumber(value:number) {
    this._turnNumber = value;
  }

  get userId(): string {
    return this._userId;
  }
  set userId(value: string) {
    this._userId = value;
  }
}
