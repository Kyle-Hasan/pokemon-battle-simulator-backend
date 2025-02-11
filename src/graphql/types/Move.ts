import { ObjectType, Field, ID, Int } from "type-graphql";
import { PP } from "./PP";
import { Effects } from "./Effects";

@ObjectType()
export class Move {
  @Field(() => ID)
  _id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  type!: string;

  @Field(() => Int)
  basePower!: number;

  @Field(() => Int, { nullable: true })
  accuracy?: number | null;

  @Field()
  category!: string;

  @Field()
  contact!: boolean;

  @Field(() => PP)
  pp!: PP;

  @Field(()=> [Effects])
  effects!:Effects[]

  @Field()
  animation!: string;
}
