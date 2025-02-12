import { prop} from '@typegoose/typegoose';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Stats {

    @Field(() => Int)
    @prop({ required: true })
    public hp!: number;


    @Field(() => Int)
    @prop({ required: true })
    public attack!: number;


    @Field(() => Int)
    @prop({ required: true })
    public defense!: number;


    @Field(() => Int)
    @prop({ required: true })
    public specialAttack!: number;

    @Field(() => Int)
    @prop({ required: true })
    public specialDefense!: number;

    @Field(() => Int) 
    @prop({ required: true })
    public speed!: number;
  }