
import { Field, ID, InputType, ObjectType } from 'type-graphql';


@ObjectType()
export class Status {

    @Field(()=>String, {nullable:true})
    burn ?:boolean




  
}



