import { Field, ID, InputType } from "type-graphql";

@InputType()
export class MoveInput {
  @Field(() => ID)
  battleId!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ID, { nullable: true })
  pokemonId?: string;

  @Field()
  isMove!: boolean;

  @Field(() => ID, { nullable: true })
  moveId?: string;

  @Field(() => ID, { nullable: true })
  switchPokemonId?: string;
}
