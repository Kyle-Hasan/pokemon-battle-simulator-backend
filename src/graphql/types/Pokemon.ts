import {ObjectType, Field, ID} from 'type-graphql'
import { PokemonSpecies } from './PokemonSpecies'
@ObjectType()
export class Pokemon {
    @Field(()=> ID)
    _id!:string
    @Field()
    nickName:string = ""
    @Field(()=> PokemonSpecies )
    pokemonSpecies !:PokemonSpecies

}