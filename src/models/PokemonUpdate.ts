import { Field, ID, Int, ObjectType } from "type-graphql";

@ObjectType()
export class PokemonUpdate {
  @Field(() => ID)
  id!: string;

  @Field(() => Int, { nullable: true })
  remainingHp?: number;

  @Field({ nullable: true })
  status?: string;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  switchedOut?: boolean;

  @Field({ nullable: true })
  switchedIn?: boolean;
}