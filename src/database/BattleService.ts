import { Types } from "mongoose";
import { pubsub, Topic } from "../graphql/resolver/pubsub";
import { Battle } from "../models/Battle";
import { BattleUpdate, BattleUpdatePlayer } from "../models/BattleUpdatePlayer";
import { Environment } from "../models/Environment";
import { Move, MoveModel } from "../models/Move";
import { MoveInput } from "../models/MoveInput";
import { PokemonInBattle } from "../models/PokemonInBattle";
import { PrimaryStatus } from "../models/Status";
import { TeamModel } from "../models/Team";
import { getTeamWithAllPokemonInfo } from "./TeamService";
import { BattleTeam } from "../models/BattleTeam";
import { PokemonSpecies, PokemonSpeciesModel } from "../models/PokemonSpecies";
import { PokemonType } from "../enums/PokemonType";
import { PlayerBattle } from "../models/PlayerBattle";
import { PlayerInfo } from "../models/Player";


export interface BattleObj {

    battle: Battle
    player1Move: MoveInput | null
    player2Move: MoveInput | null
}

interface switchResult {
    playerOneMovedFirst: boolean
    playerOneActivePokemon: PokemonInBattle
    playerTwoActivePokemon: PokemonInBattle
    otherChangedPokemonPlayerOne: PokemonInBattle[]
    otherChangedPokemonPlayerTwo: PokemonInBattle[]
    playerOneSwitched: boolean
    playerTwoSwitched: boolean

}


interface TypeEffectiveness {
    doubleDamage: number,
    halfDamage: number,
    noDamage: number;
}


// each type gets its own bit in the bitmask

const typeBitmask: Record<PokemonType, number> = {
    [PokemonType.Normal]: 1 << 0,
    [PokemonType.Fire]: 1 << 1,
    [PokemonType.Water]: 1 << 2,
    [PokemonType.Electric]: 1 << 3,
    [PokemonType.Grass]: 1 << 4,
    [PokemonType.Ice]: 1 << 5,
    [PokemonType.Fighting]: 1 << 6,
    [PokemonType.Poison]: 1 << 7,
    [PokemonType.Ground]: 1 << 8,
    [PokemonType.Flying]: 1 << 9,
    [PokemonType.Psychic]: 1 << 10,
    [PokemonType.Bug]: 1 << 11,
    [PokemonType.Rock]: 1 << 12,
    [PokemonType.Ghost]: 1 << 13,
    [PokemonType.Dragon]: 1 << 14,
    [PokemonType.Dark]: 1 << 15,
    [PokemonType.Steel]: 1 << 16,
    [PokemonType.Fairy]: 1 << 17,
};



const typeChartBitmask: Record<PokemonType, TypeEffectiveness> = {
    [PokemonType.Normal]: {
        doubleDamage: typeBitmask[PokemonType.Fighting],
        halfDamage: 0,
        noDamage: typeBitmask[PokemonType.Ghost],
    },
    [PokemonType.Fire]: {
        doubleDamage: typeBitmask[PokemonType.Water] | typeBitmask[PokemonType.Ground] | typeBitmask[PokemonType.Rock],
        halfDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Grass] | typeBitmask[PokemonType.Ice] |
            typeBitmask[PokemonType.Bug] | typeBitmask[PokemonType.Steel] | typeBitmask[PokemonType.Fairy],
        noDamage: 0,
    },
    [PokemonType.Water]: {
        doubleDamage: typeBitmask[PokemonType.Electric] | typeBitmask[PokemonType.Grass],
        halfDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Water] | typeBitmask[PokemonType.Ice] |
            typeBitmask[PokemonType.Steel],
        noDamage: 0,
    },
    [PokemonType.Electric]: {
        doubleDamage: typeBitmask[PokemonType.Ground],
        halfDamage: typeBitmask[PokemonType.Electric] | typeBitmask[PokemonType.Flying] | typeBitmask[PokemonType.Steel],
        noDamage: 0,
    },
    [PokemonType.Grass]: {
        doubleDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Ice] | typeBitmask[PokemonType.Poison] |
            typeBitmask[PokemonType.Flying] | typeBitmask[PokemonType.Bug],
        halfDamage: typeBitmask[PokemonType.Water] | typeBitmask[PokemonType.Electric] | typeBitmask[PokemonType.Grass] |
            typeBitmask[PokemonType.Ground],
        noDamage: 0,
    },
    [PokemonType.Ice]: {
        doubleDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Rock] |
            typeBitmask[PokemonType.Steel],
        halfDamage: typeBitmask[PokemonType.Ice],
        noDamage: 0,
    },
    [PokemonType.Fighting]: {
        doubleDamage: typeBitmask[PokemonType.Flying] | typeBitmask[PokemonType.Psychic] | typeBitmask[PokemonType.Fairy],
        halfDamage: typeBitmask[PokemonType.Bug] | typeBitmask[PokemonType.Rock] | typeBitmask[PokemonType.Dark],
        noDamage: 0,
    },
    [PokemonType.Poison]: {
        doubleDamage: typeBitmask[PokemonType.Ground] | typeBitmask[PokemonType.Psychic],
        halfDamage: typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Poison] | typeBitmask[PokemonType.Bug] |
            typeBitmask[PokemonType.Grass] | typeBitmask[PokemonType.Fairy],
        noDamage: typeBitmask[PokemonType.Steel],
    },
    [PokemonType.Ground]: {
        doubleDamage: typeBitmask[PokemonType.Water] | typeBitmask[PokemonType.Grass] | typeBitmask[PokemonType.Ice],
        halfDamage: typeBitmask[PokemonType.Poison] | typeBitmask[PokemonType.Rock],
        noDamage: typeBitmask[PokemonType.Electric],
    },
    [PokemonType.Flying]: {
        doubleDamage: typeBitmask[PokemonType.Electric] | typeBitmask[PokemonType.Ice] | typeBitmask[PokemonType.Rock],
        halfDamage: typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Bug] | typeBitmask[PokemonType.Grass],
        noDamage: 0,
    },
    [PokemonType.Psychic]: {
        doubleDamage: typeBitmask[PokemonType.Bug] | typeBitmask[PokemonType.Ghost] | typeBitmask[PokemonType.Dark],
        halfDamage: typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Psychic],
        noDamage: 0,
    },
    [PokemonType.Bug]: {
        doubleDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Flying] | typeBitmask[PokemonType.Rock],
        halfDamage: typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Grass] | typeBitmask[PokemonType.Ground],
        noDamage: 0,
    },
    [PokemonType.Rock]: {
        doubleDamage: typeBitmask[PokemonType.Water] | typeBitmask[PokemonType.Grass] | typeBitmask[PokemonType.Fighting] |
            typeBitmask[PokemonType.Ground] | typeBitmask[PokemonType.Steel],
        halfDamage: typeBitmask[PokemonType.Normal] | typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Poison] |
            typeBitmask[PokemonType.Flying],
        noDamage: 0,
    },
    [PokemonType.Ghost]: {
        doubleDamage: typeBitmask[PokemonType.Ghost] | typeBitmask[PokemonType.Dark],
        halfDamage: typeBitmask[PokemonType.Poison] | typeBitmask[PokemonType.Bug],
        noDamage: typeBitmask[PokemonType.Normal] | typeBitmask[PokemonType.Fighting],
    },
    [PokemonType.Dragon]: {
        doubleDamage: typeBitmask[PokemonType.Ice] | typeBitmask[PokemonType.Dragon] | typeBitmask[PokemonType.Fairy],
        halfDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Water] | typeBitmask[PokemonType.Electric] |
            typeBitmask[PokemonType.Grass],
        noDamage: 0,
    },
    [PokemonType.Dark]: {
        doubleDamage: typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Bug] | typeBitmask[PokemonType.Fairy],
        halfDamage: typeBitmask[PokemonType.Ghost] | typeBitmask[PokemonType.Dark],
        noDamage: typeBitmask[PokemonType.Psychic],
    },
    [PokemonType.Steel]: {
        doubleDamage: typeBitmask[PokemonType.Fire] | typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Ground],
        halfDamage: typeBitmask[PokemonType.Normal] | typeBitmask[PokemonType.Grass] | typeBitmask[PokemonType.Ice] |
            typeBitmask[PokemonType.Flying] | typeBitmask[PokemonType.Psychic] | typeBitmask[PokemonType.Bug] |
            typeBitmask[PokemonType.Rock] | typeBitmask[PokemonType.Dragon] | typeBitmask[PokemonType.Steel] |
            typeBitmask[PokemonType.Fairy],
        noDamage: typeBitmask[PokemonType.Poison],
    },
    [PokemonType.Fairy]: {
        doubleDamage: typeBitmask[PokemonType.Poison] | typeBitmask[PokemonType.Steel],
        halfDamage: typeBitmask[PokemonType.Fighting] | typeBitmask[PokemonType.Bug] | typeBitmask[PokemonType.Dark],
        noDamage: typeBitmask[PokemonType.Dragon],
    },
};




export class BattleService {
    battleMap: Map<string, BattleObj>;

    constructor() {
        this.battleMap = new Map()
    }

    async updateBattle(moveInput: MoveInput) {



        let battleObj = this.battleMap.get(moveInput.battleId) || { battle: null, player1Move: null, player2Move: null }
        if (!battleObj.battle) {
            throw new Error("Battle not found")
        }

        let battle = battleObj.battle


        if (moveInput.userId === battleObj.battle.player1Info.id) {
            battleObj.player1Move = moveInput

        } else {
            battleObj.player2Move = moveInput
        }

        if (battle.team1FreeSwitch && !battle.team2FreeSwitch) {
            battle.team1FreeSwitch = false

            if (battleObj.player1Move) {
                const pokemonToSwitch = battle.team1.pokemonInBattle.find(p => p.pokemon._id?.toString() === battleObj?.player1Move?.switchPokemonId)
                if (!pokemonToSwitch) {
                    throw new Error("Pokemon not found")
                }

                pokemonToSwitch.isActive = true
                pokemonToSwitch.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }
                const switchResult: switchResult = {
                    playerOneMovedFirst: false,
                    playerOneActivePokemon: pokemonToSwitch,
                    playerTwoActivePokemon: battle.team2.pokemonInBattle.find(p => p.pokemon._id?.toString() === battleObj?.player2Move?.switchPokemonId) as PokemonInBattle,
                    otherChangedPokemonPlayerOne: [],
                    otherChangedPokemonPlayerTwo: [],
                    playerOneSwitched: true,
                    playerTwoSwitched: false
                }

                this.publishBattleUpdate(battleObj, switchResult, false, null, null, false, false, battle.turnNumber)
                battleObj.player1Move = null
                battleObj.player2Move = null
                return
            }

            else if (battleObj.player2Move) {
                throw new Error("Invalid move")
            }

        }

        if (!battle.team1FreeSwitch && battle.team2FreeSwitch) {
            battle.team2FreeSwitch = false

            if (battleObj.player2Move) {
                const pokemonToSwitch = battle.team2.pokemonInBattle.find(p => p.pokemon._id?.toString() === battleObj?.player2Move?.switchPokemonId)
                if (!pokemonToSwitch) {
                    throw new Error("Pokemon not found")
                }

                pokemonToSwitch.isActive = true
                pokemonToSwitch.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }
                const switchResult: switchResult = {
                    playerOneMovedFirst: false,
                    playerOneActivePokemon: pokemonToSwitch,
                    playerTwoActivePokemon: battle.team2.pokemonInBattle[0],
                    otherChangedPokemonPlayerOne: [],
                    otherChangedPokemonPlayerTwo: [],
                    playerOneSwitched: false,
                    playerTwoSwitched: true

                }

                this.publishBattleUpdate(battleObj, switchResult, false, null, null, false, false, battle.turnNumber)
                battleObj.player1Move = null
                battleObj.player2Move = null
                return
            }

            else if (battleObj.player1Move) {
                throw new Error("Invalid move")
            }
        }

        if (battle.team1FreeSwitch && battle.team2FreeSwitch) {



            if (battleObj.player1Move && battleObj.player2Move) {

                battle.team1FreeSwitch = false
                battle.team2FreeSwitch = false


                const pokemonToSwitch1 = battle.team1.pokemonInBattle.find(p => p.pokemon._id?.toString() === battleObj?.player1Move?.switchPokemonId)
                const pokemonToSwitch2 = battle.team2.pokemonInBattle.find(p => p.pokemon._id?.toString() === battleObj?.player2Move?.switchPokemonId)

                if (!pokemonToSwitch1 || !pokemonToSwitch2) {
                    throw new Error("Pokemon not found")
                }

                pokemonToSwitch1.isActive = true
                pokemonToSwitch1.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }
                pokemonToSwitch2.isActive = true
                pokemonToSwitch2.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }

                const switchResult: switchResult = {
                    playerOneMovedFirst: false,
                    playerOneActivePokemon: pokemonToSwitch1,
                    playerTwoActivePokemon: pokemonToSwitch2,
                    otherChangedPokemonPlayerOne: [],
                    otherChangedPokemonPlayerTwo: [],
                    playerOneSwitched: true,
                    playerTwoSwitched: true
                }

                this.publishBattleUpdate(battleObj, switchResult, false, null, null, false, false, battle.turnNumber)
                battleObj.player1Move = null
                battleObj.player2Move = null





            }
            return




        }

        if (battleObj.player1Move && battleObj.player2Move) {

            const switchResult = await this.handleSwitch(battleObj.player1Move, battleObj.player2Move, battleObj)
            // both players switched out
            if (switchResult.playerOneSwitched && switchResult.playerTwoSwitched) {

                const battleUpdatePlayer = new BattleUpdatePlayer()
                battleUpdatePlayer.battleId = battleObj.battle.id
                battleUpdatePlayer.changedPlayerPokemon = [switchResult.playerOneActivePokemon, ...switchResult.otherChangedPokemonPlayerOne]
                battleUpdatePlayer.changedEnemyPokemon = [switchResult.playerTwoActivePokemon, ...switchResult.otherChangedPokemonPlayerTwo]
                battleUpdatePlayer.environment = battleObj.battle.environment
                battleUpdatePlayer.movedFirst = switchResult.playerOneMovedFirst

                this.publishBattleUpdate(battleObj, switchResult, switchResult.playerOneMovedFirst, null, null, false, false, battle.turnNumber)

            }

            const playerOneActivePokemon = switchResult.playerOneActivePokemon
            const playerTwoActivePokemon = switchResult.playerTwoActivePokemon

            let playerOneUsedMovedId = null
            let playerTwoUsedMovedId = null
            let playerOneMoveUsed = null
            let playerTwoMoveUsed = null



            if (!switchResult.playerOneSwitched) {
                playerOneUsedMovedId = playerOneActivePokemon.pokemon.moves?.find(m => m._id?.toString() === battleObj.player1Move?.moveId)
            }

            if (!switchResult.playerTwoSwitched) {
                playerTwoUsedMovedId = playerTwoActivePokemon.pokemon.moves?.find(m => m._id?.toString() === battleObj.player2Move?.moveId)
            }




            if (playerOneUsedMovedId) {
                playerOneMoveUsed = await MoveModel.findById(playerOneUsedMovedId)
            }

            if (playerTwoUsedMovedId) {
                playerTwoMoveUsed = await MoveModel.findById(playerTwoUsedMovedId)
            }


            const playerOneMovedFirst = await this.decideWhoMovesFirst(playerOneActivePokemon, playerTwoActivePokemon, playerOneMoveUsed as Move, playerTwoMoveUsed as Move) as boolean

            if (playerOneMovedFirst) {


                const player1Damage = Math.floor(this.calculateDamage(playerOneMoveUsed!, playerOneActivePokemon, playerTwoActivePokemon))
                playerTwoActivePokemon.remainingHealth = playerTwoActivePokemon.remainingHealth - player1Damage

                if (playerTwoActivePokemon.remainingHealth <= 0) {
                    playerTwoActivePokemon.isActive = false
                    playerTwoActivePokemon!.status!.primary = PrimaryStatus.Faint
                    battle.team2FreeSwitch = true
                }

                else {


                    const player2Damage = Math.floor(this.calculateDamage(playerTwoMoveUsed!, playerTwoActivePokemon, playerOneActivePokemon))
                    playerOneActivePokemon.remainingHealth = playerOneActivePokemon.remainingHealth - player2Damage

                    if (playerOneActivePokemon.remainingHealth <= 0) {
                        playerOneActivePokemon.isActive = false
                        playerOneActivePokemon!.status!.primary = PrimaryStatus.Faint
                        battle.team1FreeSwitch = true
                    }

                }



            }

            else {

                const playerTwoMoveUsed = await MoveModel.findById(playerTwoUsedMovedId)
                const player2Damage = this.calculateDamage(playerTwoMoveUsed!, playerTwoActivePokemon, playerOneActivePokemon)
                playerOneActivePokemon.remainingHealth = playerOneActivePokemon.remainingHealth - player2Damage

                if (playerOneActivePokemon.remainingHealth <= 0) {
                    playerOneActivePokemon.isActive = false
                    playerOneActivePokemon!.status!.primary = PrimaryStatus.Faint
                    battle.team1FreeSwitch = true
                }

                else {

                    const playerOneMoveUsed = await MoveModel.findById(playerOneUsedMovedId)
                    const player1Damage = this.calculateDamage(playerOneMoveUsed!, playerOneActivePokemon, playerTwoActivePokemon)
                    playerTwoActivePokemon.remainingHealth = playerTwoActivePokemon.remainingHealth - player1Damage

                    if (playerTwoActivePokemon.remainingHealth <= 0) {
                        playerTwoActivePokemon.isActive = false
                        playerTwoActivePokemon!.status!.primary = PrimaryStatus.Faint
                        battle.team2FreeSwitch = true
                    }

                }


            }
            battleObj.player1Move = null
            battleObj.player2Move = null

            const faintedPokemonCount1 = battle.team1.pokemonInBattle.filter(pokemon => pokemon.status?.primary === PrimaryStatus.Faint).length
            const faintedPokemonCount2 = battle.team2.pokemonInBattle.filter(pokemon => pokemon.status?.primary === PrimaryStatus.Faint).length

            let playerOneLoss = false
            let playerTwoLoss = false
            if (faintedPokemonCount1 === 6) {

                playerOneLoss = true

            }

            else if (faintedPokemonCount2 === 6) {
                playerTwoLoss = true

            }


            // in case of poison, sleep, or burn, we need to apply the status effect

            // player one switched out
            this.publishBattleUpdate(battleObj, switchResult, playerOneMovedFirst, playerOneMoveUsed, playerTwoMoveUsed, playerOneLoss, playerTwoLoss, battle.turnNumber)

        }

        else {
            return "waiting for moves"
        }



    }

    handleFreeSwitch(battleObj: BattleObj, switchResult: switchResult) {



    }




    publishBattleUpdate(battleObj: BattleObj, switchResult: switchResult, playerOneMovedFirst: boolean, playerOneMoveUsed: Move | null, playerTwoMoveUsed: Move | null, playerOneLoss: boolean, playerTwoLoss: boolean, turnNumber: number) {
        const battleUpdate = new BattleUpdate()
        battleUpdate.battleId = battleObj.battle.id
        battleUpdate.playerOneChangedPokemon = new BattleTeam()

        battleUpdate.playerOneChangedPokemon.pokemonInBattle = [switchResult.playerOneActivePokemon, ...switchResult.otherChangedPokemonPlayerOne]
        battleUpdate.playerTwoChangedPokemon = new BattleTeam()

        battleUpdate.playerTwoChangedPokemon.pokemonInBattle = [switchResult.playerTwoActivePokemon, ...switchResult.otherChangedPokemonPlayerTwo]
        battleUpdate.environment = battleObj.battle.environment
        battleUpdate.playerOneMovedFirst = playerOneMovedFirst
        battleUpdate.playerOneFreeSwitch = switchResult.playerOneSwitched
        battleUpdate.playerTwoFreeSwitch = switchResult.playerTwoSwitched
        battleUpdate.playerOneMoveUsed = playerOneMoveUsed
        battleUpdate.playerTwoMoveUsed = playerTwoMoveUsed
        battleUpdate.playerOneLoss = playerOneLoss
        battleUpdate.playerTwoLoss = playerTwoLoss
        
        battleUpdate.turnNumber = turnNumber + 1


        pubsub.publish(Topic.BATTLE_UPDATE, battleUpdate)
    }

    calculateDamage(move: Move, attacker: PokemonInBattle, defender: PokemonInBattle) {
        if (!move || !move.accuracy) {
            return 0
        }


        const criticalHit = Math.random() < 0.0625

        const missedChange = (100 - move.accuracy) / 100

        const missed = Math.random() < missedChange


        const getEffectiveness = this.getTypeEffectiveness(move.type as PokemonType, defender.pokemon.pokemonSpecies as PokemonSpecies)

        const attackerAttack = attacker.pokemon.stats?.attack || 0;
        const defenderDefense = defender.pokemon.stats?.defense || 1;
        const damage = (move.basePower || 0) * attackerAttack / defenderDefense * getEffectiveness;

        if (criticalHit) {
            return damage * 2
        }

        if (missed) {
            return 0
        }

        return damage;
    }


    getTypeEffectiveness(moveType: PokemonType, defenderSpecies: PokemonSpecies) {
        const defenderTypes = defenderSpecies.type

        let totalEffectiveness = 1

        let typeBit = typeBitmask[moveType]

        for (const type of defenderTypes!) {
            const { doubleDamage, halfDamage, noDamage } = typeChartBitmask[type]

            if (doubleDamage & typeBit) {
                totalEffectiveness *= 2
            }
            else if (halfDamage & typeBit) {
                totalEffectiveness *= 0.5
            }
            else if (noDamage & typeBit) {
                totalEffectiveness = 0
            }
        }

        return totalEffectiveness




    }


    // returns true if player one moves first, false if player two moves first

    async decideWhoMovesFirst(playerOneActivePokemon: PokemonInBattle, playerTwoActivePokemon: PokemonInBattle, playerOneUsedMoved: Move, playerTwoUsedMoved: Move) {
        if (!playerTwoUsedMoved) {
            return true
        }

        if (!playerOneUsedMoved) {
            return false
        }

        if (!playerTwoActivePokemon.pokemon.stats?.speed || !playerOneActivePokemon.pokemon.stats?.speed) {
            throw new Error("Speed not found")
        }


        /*
                if(playerOneUsedMoved.priority > playerTwoUsedMoved.priority) {
                    return true
                } else {
                    return false
                }*/
        if (playerTwoActivePokemon?.pokemon?.stats?.speed > playerOneActivePokemon?.pokemon?.stats?.speed) {
            return false;
        }
        else if (playerTwoActivePokemon?.pokemon?.stats?.speed < playerOneActivePokemon?.pokemon?.stats?.speed) {
            return false;
        }
        else {
            const random = Math.random()
            if (random < 0.5) {
                return true;
            } else {
                return false;
            }
        }





    }


    async handleSwitch(moveInput1: MoveInput, moveInput2: MoveInput, battleObj: BattleObj): Promise<switchResult> {


        // return active pokemon and switched out pokemon if it exists, therefore we return an array of two pokemon

        const team1 = battleObj.battle.team1;
        const team2 = battleObj.battle.team2;

        let player1CurrentPokemon = team1.pokemonInBattle.find(p => p.pokemon?._id?.toString() === moveInput1.pokemonId)


        const player1CurrentPokemonSpeed = player1CurrentPokemon?.pokemon.stats?.speed
        let player2CurrentPokemon = team2.pokemonInBattle.find(p => p.pokemon?._id?.toString() === moveInput2.pokemonId)

        const player2CurrentPokemonSpeed = player2CurrentPokemon?.pokemon.stats?.speed



        if (!player1CurrentPokemon || !player2CurrentPokemon) {
            throw new Error("Pokemon not found")
        }

        // switch out current pokemon player team

        if (!moveInput1.isMove) {

            // switch out current pokemon player team
            player1CurrentPokemon.isActive = false
            player1CurrentPokemon = team1.pokemonInBattle.find(p => p.pokemon._id?.toString() === moveInput1.switchPokemonId)
            if (!player1CurrentPokemon) {
                throw new Error("Pokemon not found")
            }
            player1CurrentPokemon.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }

            // handle other switch in effects here
        }

        if (!moveInput2.isMove) {

            // switch out current pokemon enemy team
            player2CurrentPokemon.isActive = false
            player2CurrentPokemon = team2.pokemonInBattle.find(p => p.pokemon._id?.toString() === moveInput2.switchPokemonId)
            if (!player2CurrentPokemon) {
                throw new Error("Pokemon not found")
            }
            player2CurrentPokemon.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }
        }

        let playerOneMovedFirst = false

        if (player1CurrentPokemonSpeed && player2CurrentPokemonSpeed && player1CurrentPokemonSpeed > player2CurrentPokemonSpeed) {
            playerOneMovedFirst = true
        } else {
            playerOneMovedFirst = false
        }

        const otherChangedPokemonPlayerOne: PokemonInBattle[] = []
        const otherChangedPokemonPlayerTwo: PokemonInBattle[] = []

        return {
            playerOneMovedFirst, playerOneActivePokemon: player1CurrentPokemon
            , playerTwoActivePokemon: player2CurrentPokemon, otherChangedPokemonPlayerOne, otherChangedPokemonPlayerTwo,
            playerOneSwitched: !moveInput1.isMove, playerTwoSwitched: !moveInput2.isMove
        }

    }

    async newBattle() {



        const team1 = await getTeamWithAllPokemonInfo("67b6a6d11eaed2e8f708c361")

        const team2 = await getTeamWithAllPokemonInfo("67b6a83a1760cc59c36f1a94")

        const teams = [team1, team2]


        const pokemonInBattleArr: PokemonInBattle[][] = [[], []]

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i]
            const pokeArr = pokemonInBattleArr[i]

            if (team && team.pokemon) {
                for (const pokemon of team.pokemon) {
                    const newPokemonInBattle = new PokemonInBattle()

                    newPokemonInBattle.pokemon = pokemon
                    newPokemonInBattle.isActive = false

                    newPokemonInBattle.remainingHealth = pokemon.stats?.hp || 0
                    newPokemonInBattle.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }
                    newPokemonInBattle.status = { primary: PrimaryStatus.None, confused: false }

                    pokeArr.push(newPokemonInBattle)


                }
                pokeArr[0].isActive = true
            }

        }

        const environment: Environment = {}

        const battle = new Battle()
        battle.environment = environment
        battle.team1 = { pokemonInBattle: pokemonInBattleArr[0], totalPokemon: 6, }
        battle.team2 = { pokemonInBattle: pokemonInBattleArr[1], totalPokemon: 6, }
        battle.team1FreeSwitch = false
        battle.team2FreeSwitch = false
        battle.id = "1"
        battle.player1Info = new PlayerInfo()
        battle.player1Info.id = '67abe4c8201f9cd643c552bf'
        battle.player1Info.playerName = "reona"
        battle.player1Info.playerAvatarURL = ""
        battle.player2Info = new PlayerInfo()
        battle.player2Info.id = '67b957d50ca31da275063b3b'
        battle.player2Info.playerName = "rie"
        battle.player2Info.playerAvatarURL = ""
        battle.turnNumber = 0
        this.battleMap.set("1", { battle: battle, player1Move: null, player2Move: null })

        const playerBattle = new PlayerBattle()
        playerBattle.id = battle.id
        playerBattle.playerInfo = battle.player1Info
        playerBattle.enemyInfo = battle.player2Info
        playerBattle.playerTeam = battle.team1
        playerBattle.enemyTeam = battle.team2
        playerBattle.environment = battle.environment
        playerBattle.turnNumber = 0
        playerBattle.playerSwitch = false
        playerBattle.enemySwitch = false



        return playerBattle


    }


}

/* 
{
    "data": {
        "randomBattle": {
            "id": "1",
            "team1": {
                "pokemonInBattle": [
                    {
                        "remainingHealth": 65,
                        "isActive": true,
                        "pokemon": {
                            "_id": "67b6a7921760cc59c36f199d",
                            "nickname": "",
                            "level": 100,
                            "moves": [
                                {
                                    "_id": "67aaadc210be17930ae87ffa",
                                    "name": "Flare Blitz",
                                    "description": "A high-power fire attack that causes recoil damage to the user.",
                                    "type": "fire",
                                    "basePower": "120",
                                    "accuracy": 100,
                                    "category": "physical",
                                    "contact": 1,
                                    "animation": "placeholder_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae88002",
                                    "name": "Flame Charge",
                                    "description": "A fire attack that boosts the user's Speed.",
                                    "type": "fire",
                                    "basePower": "50",
                                    "accuracy": 100,
                                    "category": "physical",
                                    "contact": 1,
                                    "animation": "flame_charge_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae8800e",
                                    "name": "Iron Tail",
                                    "description": "A physical attack that may lower the target's Defense.",
                                    "type": "steel",
                                    "basePower": "100",
                                    "accuracy": 75,
                                    "category": "physical",
                                    "contact": 1,
                                    "animation": "iron_tail_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae88010",
                                    "name": "Solar Beam",
                                    "description": "A powerful beam attack that requires a charging turn.",
                                    "type": "grass",
                                    "basePower": "120",
                                    "accuracy": 100,
                                    "category": "special",
                                    "contact": 0,
                                    "animation": "solar_beam_animation"
                                }
                            ],
                            "pokemonSpecies": {
                                "_id": "67aaadd6466bdb90aba06b69",
                                "name": "tepig",
                                "battleBackSprite": "https://play.pokemonshowdown.com/sprites/gen5ani-back/tepig.gif",
                                "battleFrontSprite": "https://play.pokemonshowdown.com/sprites/gen5ani/tepig.gif",
                                "menuSprite": "https://archives.bulbagarden.net/media/upload/9/97/498MS3.png",
                                "teamBuilderSprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/498.png",
                                "type": [
                                    "fire"
                                ]
                            }
                        }
                    },
                    {
                        "remainingHealth": 55,
                        "isActive": false,
                        "pokemon": {
                            "_id": "67b6a7bb1760cc59c36f19d0",
                            "nickname": "",
                            "level": 100,
                            "moves": [
                                {
                                    "_id": "67aaadc210be17930ae87ff3",
                                    "name": "Brine",
                                    "description": "A watery attack that deals extra damage if the target's HP is below 50%.",
                                    "type": "water",
                                    "basePower": "65",
                                    "accuracy": 100,
                                    "category": "special",
                                    "contact": 0,
                                    "animation": "placeholder_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae87ff4",
                                    "name": "Rain Dance",
                                    "description": "Summons rain for 5 turns, boosting Water-type moves.",
                                    "type": "water",
                                    "basePower": "0",
                                    "accuracy": null,
                                    "category": "status",
                                    "contact": 0,
                                    "animation": "placeholder_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae87ffe",
                                    "name": "Aqua Jet",
                                    "description": "A quick water attack that always lands first.",
                                    "type": "water",
                                    "basePower": "40",
                                    "accuracy": 100,
                                    "category": "physical",
                                    "contact": 1,
                                    "animation": "aqua_jet_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae88000",
                                    "name": "Surf",
                                    "description": "A strong water attack that can hit all adjacent opponents.",
                                    "type": "water",
                                    "basePower": "90",
                                    "accuracy": 100,
                                    "category": "special",
                                    "contact": 0,
                                    "animation": "surf_animation"
                                }
                            ],
                            "pokemonSpecies": {
                                "_id": "67aaadd6466bdb90aba06c1d",
                                "name": "oshawott",
                                "battleBackSprite": "https://play.pokemonshowdown.com/sprites/gen5ani-back/oshawott.gif",
                                "battleFrontSprite": "https://play.pokemonshowdown.com/sprites/gen5ani/oshawott.gif",
                                "menuSprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/501.png",
                                "teamBuilderSprite": "https://archives.bulbagarden.net/media/upload/8/86/501MS3.png",
                                "type": [
                                    "water"
                                ]
                            }
                        }
                    },
                    {
                        "remainingHealth": 45,
                        "isActive": false,
                        "pokemon": {
                            "_id": "67b6a81d1760cc59c36f1a74",
                            "nickname": "",
                            "level": 100,
                            "moves": [
                                {
                                    "_id": "67aaadc210be17930ae88007",
                                    "name": "Leaf Blade",
                                    "description": "A sharp leaf attack that may cause a critical hit.",
                                    "type": "grass",
                                    "basePower": "90",
                                    "accuracy": 100,
                                    "category": "physical",
                                    "contact": 1,
                                    "animation": "leaf_blade_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae88008",
                                    "name": "Giga Drain",
                                    "description": "A Grass-type attack that drains health from the target.",
                                    "type": "grass",
                                    "basePower": "75",
                                    "accuracy": 100,
                                    "category": "special",
                                    "contact": 0,
                                    "animation": "giga_drain_animation"
                                },
                                {
                                    "_id": "67aaadc210be17930ae8800e",
                                    "name": "Iron Tail",
                                    "description": "A physical attack that may lower the target's Defense.",
                                    "type": "steel",
                                    "basePower": "100",
                                    "accuracy": 75,
                                    "category": "physical",
                                    "contact": 1,
                                    "animation": "iron_tail_animation"
                                }
                            ],
                            "pokemonSpecies": {
                                "_id": "67aaadd6466bdb90aba06cc5",
                                "name": "snivy",
                                "battleBackSprite": "https://play.pokemonshowdown.com/sprites/gen5ani-back/snivy.gif",
                                "battleFrontSprite": null,
                                "menuSprite": "https://archives.bulbagarden.net/media/upload/0/06/495MS3.png",
                                "teamBuilderSprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/495.png",
                                "type": [
                                    "grass"
                                ]
                            }
                        }
                    }
                ]
            },
            "team2": {
                "pokemonInBattle": [
                    {
                        "remainingHealth": 55,
                        "isActive": true,
                        "pokemon": {
                            "_id": "67b6a8451760cc59c36f1a9c",
                            "nickname": "",
                            "level": 100
                        }
                    },
                    {
                        "remainingHealth": 65,
                        "isActive": false,
                        "pokemon": {
                            "_id": "67b6a85a1760cc59c36f1aaf",
                            "nickname": "",
                            "level": 100
                        }
                    },
                    {
                        "remainingHealth": 45,
                        "isActive": false,
                        "pokemon": {
                            "_id": "67b6a86e1760cc59c36f1acc",
                            "nickname": "",
                            "level": 100
                        }
                    },
                    {
                        "remainingHealth": 65,
                        "isActive": false,
                        "pokemon": {
                            "_id": "67b6ce989ae3acec2dc2c68d",
                            "nickname": "",
                            "level": 100
                        }
                    },
                    {
                        "remainingHealth": 55,
                        "isActive": false,
                        "pokemon": {
                            "_id": "67b6d118829d9c0cf01ba4a7",
                            "nickname": "",
                            "level": 100
                        }
                    }
                ]
            },
            "environment": {
                "weather": null,
                "terrain": null,
                "fieldEffects": null,
                "hazards": null
            }
        }
    }
}
    */
