import {ObjectType, Field, ID} from 'type-graphql'

@ObjectType()
export class Pokemon {
    @Field(()=> ID)
    _id!:string
    @Field()
    name:string = ""
    @Field(()=> [Pokemon] )
    pokemon !:Pokemon[]

}