import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class Effects {
  @Field({ nullable: true })
  someEffect?: string;
}
