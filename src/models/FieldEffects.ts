import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class FieldEffects {
  @Field()
  trickRoom!: boolean;

  @Field()
  gravity!: boolean;

  @Field(() => Int)
  tailwind!: number; // Turns remaining

  @Field(() => Int)
  lightScreen!: number;

  @Field(() => Int)
  reflect!: number;

  @Field(() => Int)
  safeguard!: number;
}