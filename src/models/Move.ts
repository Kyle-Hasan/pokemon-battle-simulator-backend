import { getModelForClass, prop } from '@typegoose/typegoose';
import { PP } from './PP';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Types } from 'mongoose';
import { PokemonType } from '../enums/PokemonType';


@ObjectType()
export class Move {

  @Field(() => ID)
  public readonly _id?: Types.ObjectId | null | string;

  @Field(()=> String, {nullable:true})
  @prop({ required: true })
  public name!: string;


  @Field(()=> String, {nullable:false})
  @prop()
  public description?: string;


  @Field(()=> String, {nullable:false})
  @prop({ required: true, enum: PokemonType, type: String }) 
  public type?: PokemonType;

  @Field(()=> String, {nullable:false})
  @prop()
  public basePower?: number;


  @Field(() => Int, { nullable: true })
  @prop({ required: false })
  public accuracy?: number | null;


  @Field(()=> String, {nullable:false})
  @prop()
  public category?: string;

  @Field(() => Int)
  @prop()
  public contact?: boolean;

  @Field(() => PP)
  @prop({ required: true, type: () => PP })
  public pp!: PP;


  @Field(()=> String, {nullable:false})
  @prop({ required: true })
  public animation!: string;
}

export const MoveModel = getModelForClass(Move);
