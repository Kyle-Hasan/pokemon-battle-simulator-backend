
import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { AddPokemonInput, Pokemon } from './Pokemon';
import { User } from './User';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { Types } from 'mongoose';

@ObjectType()
export class Team {

  @Field(() => ID)
  public readonly _id?: Types.ObjectId | string;
  
  @Field()
  @prop({ required: false,default:"" })
  public name?: string


  @Field(()=>[Pokemon])
  @prop({ type: () => Pokemon, default: [] })
  
  public pokemon?:Pokemon[]

  



}


@InputType()
export class AddTeamInput implements Partial<Team>{


  @Field({nullable:true})
  public _id?:string

  @Field({nullable:true})
  public name?: string

  @Field(()=>[AddPokemonInput],{nullable:true})
  public pokemon?:AddPokemonInput[]

}


export const TeamModel = getModelForClass(Team);