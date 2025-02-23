import { createPubSub } from "@graphql-yoga/subscription";
import { BattleUpdate, BattleUpdatePlayer } from "../../models/BattleUpdatePlayer";


export const enum Topic {
  BATTLE_UPDATE = "BATTLE_UPDATE",

}

export const pubsub = createPubSub<
  {
    [Topic.BATTLE_UPDATE]: [BattleUpdate];
   
  } 
>();