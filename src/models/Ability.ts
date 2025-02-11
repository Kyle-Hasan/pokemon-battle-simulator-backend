import { getModelForClass, prop } from '@typegoose/typegoose';
import { Effects } from './Effect';

export class Ability {

  
    @prop({ required: true })
    public name!: string;
  
    @prop()
    public description?: string;
  
    @prop({ required: true })
    public animation!: string;
  
    @prop({ type: () => Effects })
    public effects?: Effects;
  }


export const AbilityModel = getModelForClass(Ability);
  