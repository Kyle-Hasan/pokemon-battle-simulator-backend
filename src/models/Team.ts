
import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Pokemon } from './Pokemon';
import { User } from './User';


export class Team {
  

  @prop({ required: false,default:"" })
  public name?: string

  @prop({required:false})
  public pokemon?:Pokemon[]

  



}


export const TeamModel = getModelForClass(Team);