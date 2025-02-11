import { prop } from '@typegoose/typegoose';

export class PP {
    @prop({ required: true })
    public base!: number;
  
    @prop({ required: true })
    public max!: number;
  }