
import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Team } from './Team';


export class User {
  

  @prop({ required: true })
  public name!: string;

  @prop({ ref: () => Team, default: [] })       
  public teams!: Ref<Team>[];

  

  

  
}


export const UserModel = getModelForClass(User);