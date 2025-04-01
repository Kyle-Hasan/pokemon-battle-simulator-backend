import { getModelForClass, prop } from '@typegoose/typegoose';
import { PP } from './PP';
import { Field, ID, Int, ObjectType, registerEnumType } from 'type-graphql';
import { Types } from 'mongoose';
import { PokemonType } from '../enums/PokemonType';
 

export enum MoveCategory {
  STATUS = 'status',
  SPECIAL = 'special',
  PHYSICAL = 'physical'
}



registerEnumType(MoveCategory, {
  name: "MoveCategory",
});

@ObjectType()
export class Move {

  @Field(() => ID)
  public readonly _id?: Types.ObjectId | null | string;


  @prop({ required: true })
  @Field(()=> String, {nullable:true})
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


  @Field(()=> MoveCategory, {nullable:false})
  @prop()
  public category?: MoveCategory;

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
