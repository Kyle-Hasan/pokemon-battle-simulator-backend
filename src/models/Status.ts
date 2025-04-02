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
  @Field(() => PrimaryStatus)
  private _primary?: PrimaryStatus | undefined;
 

  @Field()
  private _confused?: boolean | undefined;
  

  constructor(primary:PrimaryStatus = PrimaryStatus.None, confused:boolean = false) {
    this._primary = primary;
    this._confused = confused;
  }

  

  public get primary(): PrimaryStatus | undefined {
    return this._primary;
  }
  public set primary(value: PrimaryStatus | undefined) {
    this._primary = value;
  }

  public get confused(): boolean | undefined {
    return this._confused;
  }
  public set confused(value: boolean | undefined) {
    this._confused = value;
  }




}


