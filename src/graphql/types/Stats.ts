import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class Stats {
  @Field(() => Int)
  hp!: number;

  @Field(() => Int)
  attack!: number;

  @Field(() => Int)
  defense!: number;

  @Field(() => Int)
  specialAttack!: number;

  @Field(() => Int)
  specialDefense!: number;

  @Field(() => Int)
  speed!: number;
}
