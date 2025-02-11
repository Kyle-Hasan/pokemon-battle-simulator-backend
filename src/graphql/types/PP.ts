import { ObjectType,Field, Int } from "type-graphql";

@ObjectType()
export class PP {
    @Field(() => Int)
    base!: number;

    @Field(() => Int)
    max!: number;


}