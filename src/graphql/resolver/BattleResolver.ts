
import { Mutation, Resolver } from "type-graphql";
import { Battle } from "../../models/Battle";
import { BattleService } from "../../database/BattleService";

@Resolver(() => Battle)
export class BattleResolver {
    battleService: BattleService;

    constructor() {

        this.battleService = new BattleService()
    }
    @Mutation(_returns => Battle)
    async randomBattle() {

        return await this.battleService.newBattle()


    }

    

}
