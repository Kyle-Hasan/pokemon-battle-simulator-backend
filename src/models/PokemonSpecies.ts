
import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Move } from './Move';
import { Ability } from './Ability';
import { Stats } from './Stats';
import { Effects } from './Effect';
import { Schema, Types } from 'mongoose';
import { Field, ID, ObjectType } from 'type-graphql';
import { PokemonType } from '../enums/PokemonType';

@ObjectType()
export class PokemonSpecies {

  @Field(() => ID)
  public readonly _id?: Types.ObjectId | string;

  @Field(()=> String, {nullable:false})
  @prop({ required: true })
  public name!: string;

  @Field(()=> Stats)
  @prop({ required: true, type: () => Stats })
  public baseStats!: Stats;

  @Field(()=> String, {nullable:true})
  @prop({ required: true })
  public battleBackSprite!: string;

  @Field(()=> String, {nullable:true})
  @prop({ required: true })
  public battleFrontSprite!: string;

  @Field(()=> String, {nullable:false})
  @prop({ required: true })
  public menuSprite!: string;

  @Field(()=> String, {nullable:false})
  @prop({ required: true })
  public teamBuilderSprite!: string;

  @Field(()=>[Move])
  @prop({ ref: () => Move, default: [] })
  public learnableMoves!: Ref<Move>[];

  @Field(()=>[Ability])
  @prop({ ref: () => Ability, default: [] })
  public abilities!: Ref<Ability>[];

  

  @Field(()=> [String], {nullable:false})
  @prop({ required: true, enum: PokemonType, type: String}) 
  public type?: PokemonType[];

}


export const PokemonSpeciesModel = getModelForClass(PokemonSpecies);
