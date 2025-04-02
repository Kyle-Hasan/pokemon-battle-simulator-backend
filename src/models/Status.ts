import { ObjectType, Field, registerEnumType } from "type-graphql";

export enum PrimaryStatus {
  Normal,
  Sleep,
  Burn,
  Faint,
  None
}

registerEnumType(PrimaryStatus, {
  name: "PrimaryStatus",
  description: "The primary condition of a Pokémon. Only one primary status can be active at a time.",
});


@ObjectType()
export class Status {
  @Field(() => PrimaryStatus,{name: "primary"})
  protected _primary: PrimaryStatus = PrimaryStatus.None;
 

  @Field(()=> Boolean, {name: "confused"})
  protected _confused: boolean = false;
  

  constructor(primary:PrimaryStatus = PrimaryStatus.None, confused:boolean = false) {
    this._primary = primary;
    this._confused = confused;
  }

  

  public get primary(): PrimaryStatus {
    return this._primary;
  }
  public set primary(value: PrimaryStatus) {
    this._primary = value;
  }

  public get confused(): boolean{
    return this._confused;
  }
  public set confused(value: boolean) {
    this._confused = value;
  }




}


