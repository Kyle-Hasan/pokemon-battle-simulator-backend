import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class PlayerInfo {
 
  id!: string;

  @Field(()=> String)
  playerName!:string

  @Field(()=> String)
  playerAvatarURL!:string

  

}