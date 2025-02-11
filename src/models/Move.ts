import { getModelForClass, prop } from '@typegoose/typegoose';
import { PP } from './PP';

export class Move {
  
  
    @prop({ required: true })
    public name!: string;
  
    @prop()
    public description?: string;
  
    @prop()
    public type?: string;
  
    @prop()
    public basePower?: number;

    @prop()
    public accuracy?: number | null;


  
    @prop()
    public category?: string;
  
    @prop()
    public contact?: boolean;
  
    @prop({ required: true, type: () => PP })
    public pp!: PP;
  
    @prop({ required: true })
    public animation!: string;
  }

  export const MoveModel = getModelForClass(Move);
