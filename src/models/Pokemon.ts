
import { prop, getModelForClass, Ref, Prop } from '@typegoose/typegoose';
import { PokemonSpecies } from './PokemonSpecies';
import { Types } from 'mongoose';
import { Field, ID, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class Pokemon {


    @Field(() => ID)
    public readonly _id?: Types.ObjectId | string;


    @Field(()=> String, {nullable:true})
    @prop({ required: true })
    public nickname?: string;

    @Field(() => PokemonSpecies)
    @prop({ref: () => PokemonSpecies, required:true})
    public pokemonSpecies!:  Ref<PokemonSpecies>
  
}


@InputType()
export class AddPokemonInput implements Partial<Pokemon> {

    @Field(()=> String, {nullable:true})
    public nickname?: string;

    @Field(() => String)
    public pokemonSpecies!:  string | Ref<PokemonSpecies>


}


export const PokemonModel = getModelForClass(Pokemon);
