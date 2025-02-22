import { Arg, Ctx, Mutation, Resolver, Root, SubscribeResolverData, Subscription, SubscriptionHandlerData} from "type-graphql";
import { Battle } from "../../models/Battle";
import { BattleService } from "../../database/BattleService";
import { withFilter } from "graphql-subscriptions";
import { BattleUpdate } from "../../models/BattleUpdate";
import { pubsub, Topic } from "./pubsub";
import { Environment } from "../../models/Environment";
import { Pokemon } from "../../models/Pokemon";





@Resolver(() => Battle)
export class BattleResolver {
    battleService: BattleService;

    constructor() {

        this.battleService = new BattleService()
    }
    @Mutation(_returns => Battle)
    async randomBattle() {

    

        const battle = await this.battleService.newBattle()
        pubsub.publish(Topic.BATTLE_UPDATE, { battleId: battle.id, changedAllyPokemon: [], changedEnemyPokemon: [], environment: battle.environment })
        return battle


    }


    @Mutation(_returns => String)
    async updateBattle() {
        const battle = { battleId: "1", changedAllyPokemon: [], changedEnemyPokemon: [], environment: "test" }
        pubsub.publish(Topic.BATTLE_UPDATE, { battleId: "1", changedAllyPokemon: [], changedEnemyPokemon: [], environment:{}})
        return "abcd"
    }


     // Subscription that sends battle updates.
  // It uses a filter to only send updates for the specific battle a client is interested in.
  
  @Subscription(() => BattleUpdate, {
    topics: Topic.BATTLE_UPDATE,
    filter: ({ payload, args }: SubscriptionHandlerData<BattleUpdate>) => {
      if (!payload) return false;  // 🔥 Prevents execution on first subscribe
      return payload.battleId === args.battleId;
    }
  })
  battleUpdate(
    @Root() payload: BattleUpdate,
    @Arg("battleId") battleId: string
  ): BattleUpdate {
    
    return payload;
  }

}


    


