
import { prop, getModelForClass, Ref, Prop } from '@typegoose/typegoose';
import { PokemonSpecies } from './PokemonSpecies';
import { Types } from 'mongoose';


export class Pokemon {

    public readonly _id?: Types.ObjectId | null | string;

    @prop({ required: true })
    public nickname?: string;

    @prop({required: true})
    public pokemonSpecies!:  Ref<PokemonSpecies>
  
}


