import { Arg, Ctx, Mutation, Resolver, Root, SubscribeResolverData, Subscription, SubscriptionHandlerData} from "type-graphql";
import { Battle } from "../../models/Battle";
import { BattleService } from "../../database/BattleService";
import { withFilter } from "graphql-subscriptions";
import { BattleUpdate, BattleUpdatePlayer } from "../../models/BattleUpdatePlayer";
import { pubsub, Topic } from "./pubsub";
import { Environment } from "../../models/Environment";
import { Pokemon } from "../../models/Pokemon";
import { MoveInput } from "../../models/MoveInput";
import { PlayerBattle } from "../../models/PlayerBattle";





@Resolver(() => Battle)
export class BattleResolver {
    battleService: BattleService;

    constructor() {

        this.battleService = new BattleService()
    }
    @Mutation(_returns => PlayerBattle)
    async randomBattle() {

    
        const battle = await this.battleService.newBattle();
        return battle;


    }


    @Mutation(_returns => String)
    async updateBattle(@Arg("moveInput") moveInput:MoveInput) {
        const battle = { battleId: "1", changedAllyPokemon: [], changedEnemyPokemon: [], environment: "test" }
        
        this.battleService.updateBattle(moveInput)
        return "received"
    }


     // Subscription that sends battle updates.
  // It uses a filter to only send updates for the specific battle a client is interested in.
  
  @Subscription(() => BattleUpdatePlayer, {
    topics: Topic.BATTLE_UPDATE,
    nullable:true,
    filter: ({ payload, args }: SubscriptionHandlerData<BattleUpdatePlayer>) => {
      if (!payload) return false;  
      return payload.battleId === args.battleId;
    }
  })
  battleUpdate(
    @Root() payload: BattleUpdate,
    @Arg("battleId") battleId: string
  ): BattleUpdatePlayer | void {

   

    
    if(!payload) {
      return ;
    }


    const battleUpdatePlayer = new BattleUpdatePlayer()
    battleUpdatePlayer.battleId = payload.battleId
    battleUpdatePlayer.changedPlayerPokemon = payload.playerOneChangedPokemon.pokemonInBattle
    battleUpdatePlayer.changedEnemyPokemon = payload.playerTwoChangedPokemon.pokemonInBattle
    battleUpdatePlayer.environment = payload.environment
    battleUpdatePlayer.movedFirst = payload.playerOneMovedFirst
    battleUpdatePlayer.playerFreeSwitch = payload.playerOneFreeSwitch
    battleUpdatePlayer.enemyFreeSwitch = payload.playerTwoFreeSwitch
    battleUpdatePlayer.playerDamage = payload.playerOneDamage
    battleUpdatePlayer.enemyDamage = payload.playerTwoDamage
    battleUpdatePlayer.playerMoveUsed = payload.playerOneMoveUsed
    battleUpdatePlayer.enemyMoveUsed = payload.playerTwoMoveUsed
    battleUpdatePlayer.playerLost = payload.playerOneLoss ?? null
    battleUpdatePlayer.enemyLost = payload.playerTwoLoss ?? null
    battleUpdatePlayer.turnNumber = payload.turnNumber;
    

    return battleUpdatePlayer
  }

}


    


