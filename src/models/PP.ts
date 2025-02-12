import { prop } from '@typegoose/typegoose';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class PP {

    @Field(() => Int)
    @prop({ required: true })
    public base!: number;


    @Field(() => Int)
    @prop({ required: true })
    public max!: number;
  }