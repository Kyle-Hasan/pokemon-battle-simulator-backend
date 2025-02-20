import { Field, ObjectType } from "type-graphql";
import { WeatherEffect } from "./WeatherEffect";
import { TerrainEffect } from "./TerrainEffect";
import { HazardState } from "./HazardState";
import { FieldEffects } from "./FieldEffects";

@ObjectType()
export class Environment {
  @Field(() => WeatherEffect, { nullable: true })
  weather?: WeatherEffect;

  @Field(() => TerrainEffect, { nullable: true })
  terrain?: TerrainEffect;

  @Field(() => HazardState, {nullable: true})
  hazards?: HazardState;

  @Field(() => FieldEffects, {nullable: true})
  fieldEffects?: FieldEffects;
}