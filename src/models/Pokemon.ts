
import { prop, getModelForClass, Ref, Prop } from '@typegoose/typegoose';
import { PokemonSpecies } from './PokemonSpecies';
import { Types } from 'mongoose';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { Move } from './Move';
import { Ability } from './Ability';

@ObjectType()
export class Pokemon {


    @Field(() => ID)
    public readonly _id?: Types.ObjectId | string;


    @Field(()=> String, {nullable:true})
    @prop()
    public nickname?: string;

    @Field(() => PokemonSpecies)
    @prop({ref: () => PokemonSpecies, required:true})
    public pokemonSpecies!:  Ref<PokemonSpecies>

    @Field(()=> [Move],{nullable:true})
    @prop({ ref: () => Move, default: [] })
    public moves?: Ref<Move>[] | Move[];

    @Field(()=> Ability, {nullable:true})
    @prop({ ref: () => Move, default: null })
    public ability?: Ref<Ability> | Ability;
  
}


@InputType()
export class AddPokemonInput implements Partial<Pokemon> {

    @Field(()=> String, {nullable:true})
    public nickname?: string;

    @Field(() => String)
    public pokemonSpecies!:  string | Ref<PokemonSpecies>

    @Field(() => [String], {nullable:true})
    public moves?: Ref<Move>[];

    @Field(() => String, {nullable:true})
    public ability?: Ref<Ability>;


}


export const PokemonModel = getModelForClass(Pokemon);
