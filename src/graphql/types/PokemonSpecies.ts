import {ObjectType, Field, ID} from 'type-graphql'
import { Ability } from './Ability'
import { Move } from './Move'
import {Stats} from './Stats'
@ObjectType()
export class PokemonSpecies {
    @Field(()=> ID)
    _id!:string
    @Field()
    name!:string
    @Field()
    teamBuilderSprite!:string
    @Field()
    battleSprite!:string
    @Field()
    menuSprite!:string
    @Field(() => [Ability])
    abilities!: Ability[];
    @Field(()=> [Move])
    learnableMoves !:Move[]
    @Field(()=> Stats)
    baseStats !:Stats
    

}