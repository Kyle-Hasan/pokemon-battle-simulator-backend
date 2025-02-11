import { prop} from '@typegoose/typegoose';

export class Stats {
    @prop({ required: true })
    public hp!: number;
  
    @prop({ required: true })
    public attack!: number;
  
    @prop({ required: true })
    public defense!: number;
  
    @prop({ required: true })
    public specialAttack!: number;
  
    @prop({ required: true })
    public specialDefense!: number;
  
    @prop({ required: true })
    public speed!: number;
  }