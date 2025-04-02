import { Field, ID, ObjectType } from "type-graphql";
import { Environment } from "./Environment";
import { BattleTeam } from "./BattleTeam";
import { PlayerInfo } from "./Player";
import { BattleTurnEvent } from "./BattleTurnEvent";

@ObjectType()
export class Battle {
  @Field(() => String)
  id!: string;

  @Field(() => [BattleTeam], { name: "teams" })
  protected _teams: BattleTeam[] = [];

  @Field(() => Environment, { name: "environment" })
  protected _environment!: Environment;

  @Field(() => Number, { name: "turnNumber" })
  protected _turnNumber: number = 0;

  @Field(() => [BattleTurnEvent], { name: "events" })
  protected _events: BattleTurnEvent[] = [];

  constructor(teams:BattleTeam[], id:string, environment:Environment = new Environment()) {
    this._teams = teams;
    this.id = id;
    this.environment = environment;
  }

  get teams(): BattleTeam[] {
    return this._teams;
  }

  get environment(): Environment {
    return this._environment;
  }

  set environment(env: Environment) {
    this._environment = env;
  }

  get events(): BattleTurnEvent[] {
    return this._events;
  }

  get turnNumber(): number {
    return this._turnNumber;
  }

  startTurn(): void {
    this._turnNumber++;
  }

  addEvent(...event: BattleTurnEvent[]): void {
    this._events.push(...event);
  }

  setFreeTurnForTeam(teamId: string): void {
    const team = this._teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    team.freeSwitch = true;
  }
}
