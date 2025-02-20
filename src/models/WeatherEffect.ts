import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class WeatherEffect {
  @Field()
  type!: string;

  @Field(() => Int)
  duration!: number; 
}
