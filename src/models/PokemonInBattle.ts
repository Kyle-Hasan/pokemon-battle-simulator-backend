
import { prop, getModelForClass, Ref, Prop } from '@typegoose/typegoose';
import { PokemonSpecies } from './PokemonSpecies';
import { Types } from 'mongoose';
import { Field, ID, InputType, Int, ObjectType } from 'type-graphql';
import { Move } from './Move';
import { Ability } from './Ability';
import { Pokemon } from './Pokemon';
import { Status } from './Status';
import { Stats } from './Stats';

@ObjectType()
export class PokemonInBattle {

    @Field(() => Pokemon)
  
    public pokemon!:  Pokemon

    @Field(()=>Status, {nullable:true})
    public status?: Status

    @Field(()=>Number)
    public remainingHealth!:number

    @Field(()=>Boolean)
    public isActive !:boolean

    @Field(()=>Stats)
    public statStages !:Stats




  
}



