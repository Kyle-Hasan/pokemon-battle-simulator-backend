import { Field, ID, ObjectType } from "type-graphql";
import { Environment } from "./Environment";
import { BattleTeam } from "./BattleTeam";

@ObjectType()
export class Battle {
  @Field(() => ID)
  id!: string;

  @Field(() => BattleTeam)
  team1!: BattleTeam;

  @Field(() => BattleTeam)
  team2!: BattleTeam;

  @Field(() => Environment)
  environment!: Environment;
}