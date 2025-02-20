import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class HazardState {
  @Field(() => Int)
  spikes!: number;

  @Field(() => Int)
  toxicSpikes!: number;

  @Field()
  stealthRock!: boolean;

  @Field()
  stickyWeb!: boolean;
}