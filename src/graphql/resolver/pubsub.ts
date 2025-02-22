import { createPubSub } from "@graphql-yoga/subscription";
import { BattleUpdate } from "../../models/BattleUpdate";


export const enum Topic {
  BATTLE_UPDATE = "BATTLE_UPDATE",

}

export const pubsub = createPubSub<
  {
    [Topic.BATTLE_UPDATE]: [BattleUpdate];
   
  } // Fallback for dynamic topics
>();