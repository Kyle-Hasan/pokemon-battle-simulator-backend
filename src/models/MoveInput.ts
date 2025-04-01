import { Field, ID, InputType} from "type-graphql";
import { PokemonInBattle } from "./PokemonInBattle";



 

@InputType()
export class MoveInput {
  @Field(() => ID)
  battleId!: string;

  @Field(() => ID)
  teamId!: string;

  @Field(() => ID )
  userPokemonId!: string;

  // set after receiving
  userPokemon?:PokemonInBattle;


  @Field(()=> ID, {nullable:true})
  targetPokemonId?:string;

  @Field()
  isMove!: boolean;

  @Field(() => ID, { nullable: true })
  moveId?: string;

  @Field(() => ID, { nullable: true })
  switchPokemonId?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;
}
