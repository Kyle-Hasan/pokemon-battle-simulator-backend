
import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Move } from './Move';
import { Ability } from './Ability';
import { Stats } from './Stats';
import { Effects } from './Effect';
import { Schema } from 'mongoose';


export class PokemonSpecies {
  

  @prop({ required: true })
  public name!: string;

  @prop({ required: true, type: () => Stats })
  public baseStats!: Stats;

  @prop({ required: true })
  public battleSprite!: string;

  @prop({ required: true })
  public menuSprite!: string;

  @prop({ required: true })
  public teamBuilderSprite!: string;

 
  @prop({ ref: () => Move, default: [] })
  public learnableMoves!: Ref<Move>[];


  @prop({ ref: () => Ability, default: [] })
  public abilities!: Ref<Ability>[];

  @prop({ type: () => Effects })
  public effects?: Effects;
}


export const PokemonSpeciesModel = getModelForClass(PokemonSpecies);
