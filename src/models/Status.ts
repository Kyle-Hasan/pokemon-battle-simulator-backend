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
  primary?: PrimaryStatus;

  @Field()
  confused?: boolean;


}


