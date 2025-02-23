import { Field, ID, Int, ObjectType } from "type-graphql";
import { Status } from "./Status";

@ObjectType()
export class PokemonUpdate {
  
  @Field(() => Int, { nullable: true })
  remainingHp?: number;

  @Field(() => Status, { nullable: true })
  status?: Status;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  switchedOut?: boolean;

  @Field({ nullable: true })
  switchedIn?: boolean;
}