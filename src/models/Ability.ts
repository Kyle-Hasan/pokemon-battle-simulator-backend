import { getModelForClass, prop } from '@typegoose/typegoose';
import { Effects } from './Effect';
import { Field, ID, ObjectType } from 'type-graphql';
import { Types } from 'mongoose';
@ObjectType()
export class Ability {

    @Field(()=> ID, {nullable:true})
    public readonly _id?: Types.ObjectId | string;

    @Field(()=> String, {nullable:true})
    @prop({ required: true })
    public name?: string;

    @Field(()=> String, {nullable:false})
    @prop()
    public description?: string;

    @Field(()=> String, {nullable:false})
    @prop({ required: true })
    public animation!: string;

    @Field(()=> String, {nullable:false})
    @prop({ type: () => Effects })
    public effects?: Effects;
  }


export const AbilityModel = getModelForClass(Ability);
  