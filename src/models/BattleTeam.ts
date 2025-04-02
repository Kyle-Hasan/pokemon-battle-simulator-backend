import { Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { PokemonInBattle } from "./PokemonInBattle";
import { PlayerInfo } from "./Player";

@ObjectType()
export class BattleTeam {
  @Field(() => ID)
  id!: string;

  @Field(() => [PokemonInBattle], { name: "pokemonInBattle" })
  protected _pokemonInBattle: PokemonInBattle[] = [];

 
  private _userId!: string;

  @Field(() => PlayerInfo, { name: "playerInfo" })
  protected _playerInfo!: PlayerInfo;

  @Field(() => Boolean, { name: "freeSwitch" })
  protected _freeSwitch: boolean = false;


  @Field(()=> Int, {name: "numTotalPokemon"})
  protected _numTotalPokemon:number = 0;


  constructor(playerInfo:PlayerInfo,freeSwitch:boolean,userId:string,pokemonInBattle:PokemonInBattle[], numTotalPokemon:number, id:string) {
    this._playerInfo = playerInfo;
    this.freeSwitch = freeSwitch;
    this._userId = userId;
    this._pokemonInBattle = pokemonInBattle;
    this._numTotalPokemon = numTotalPokemon;
    this.id = id;

  }

  get pokemonInBattle(): PokemonInBattle[] {
    return this._pokemonInBattle;
  }

  get numTotalPokemon():number {
    return this._numTotalPokemon;
  }



  get playerInfo(): PlayerInfo {
    return this._playerInfo;
  }

  get freeSwitch(): boolean {
    return this._freeSwitch;
  }

  get userId(): string {
    return this._userId;
  }

  public set freeSwitch (freeSwitch:boolean) {
    this._freeSwitch = freeSwitch;
  }

  addPokemon(pokemon: PokemonInBattle): void {
    this._pokemonInBattle.push(pokemon);
  }

  removeFaintedPokemon(): void {
    this._pokemonInBattle = this._pokemonInBattle.filter(p => !p.isFainted());
  }

  
}

