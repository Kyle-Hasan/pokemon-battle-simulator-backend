import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Field, ID, ObjectType } from 'type-graphql';
@ObjectType()
export class Effects {

    @Field(()=> ID)
    public readonly _id?: Types.ObjectId | string;


    @Field(()=> String, {nullable:false})
    @Field({ nullable: true })
    public someEffect?: string;
  }