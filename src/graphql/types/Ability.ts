import {ObjectType, Field, ID} from 'type-graphql'
import { Effects} from './Effects'

@ObjectType()
export class Ability {
    @Field(()=> ID)
    _id!:string
    @Field()
    name!:string
    @Field(()=>Effects, {nullable:true})
    effects?:Effects
    @Field()
    description!:string
    @Field()
    animation!:string


}