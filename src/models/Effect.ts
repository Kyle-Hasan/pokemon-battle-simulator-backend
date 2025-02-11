import { prop } from '@typegoose/typegoose';

export class Effects {
    @prop()
    public someEffect?: string;
  }