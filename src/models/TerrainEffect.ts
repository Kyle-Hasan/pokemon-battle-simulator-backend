import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class TerrainEffect {
  @Field()
  type!: string; 

  @Field(() => Int)
  duration!: number;
}