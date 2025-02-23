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
    playerOneSwitchedOut: boolean
    playerTwoSwitchedOut: boolean
}

export class BattleService {
    battleMap: Map<string, BattleObj>;

    constructor() {
        this.battleMap = new Map()
    }

    async updateBattle(moveInput: MoveInput) {

        debugger

        let battleObj = this.battleMap.get(moveInput.battleId) || { battle: null, player1Move: null, player2Move: null }
        if (!battleObj.battle) {
            throw new Error("Battle not found")
        }

        if (moveInput.userId === battleObj.battle.team1.userId) {
            battleObj.player1Move = moveInput
        } else {
            battleObj.player2Move = moveInput
        }


        if (battleObj.player1Move && battleObj.player2Move) {

            const switchResult = await this.handleSwitch(battleObj.player1Move, battleObj.player2Move, battleObj.battle.team1.userId, battleObj)
            // both players switched out
            if (switchResult.playerOneSwitchedOut && switchResult.playerTwoSwitchedOut) {

                const battleUpdatePlayer = new BattleUpdatePlayer()
                battleUpdatePlayer.battleId = battleObj.battle.id
                battleUpdatePlayer.changedAllyPokemon = [switchResult.playerOneActivePokemon, ...switchResult.otherChangedPokemonPlayerOne]
                battleUpdatePlayer.changedEnemyPokemon = [switchResult.playerTwoActivePokemon, ...switchResult.otherChangedPokemonPlayerTwo]
                battleUpdatePlayer.environment = battleObj.battle.environment
                battleUpdatePlayer.movedFirst = switchResult.playerOneMovedFirst

                this.publishBattleUpdate(battleObj, switchResult, switchResult.playerOneMovedFirst, null, null)

            }

            const playerOneActivePokemon = switchResult.playerOneActivePokemon
            const playerTwoActivePokemon = switchResult.playerTwoActivePokemon

            let playerOneUsedMovedId = null
            let playerTwoUsedMovedId = null
            let playerOneMoveUsed = null
            let playerTwoMoveUsed = null



            if (!switchResult.playerOneSwitchedOut) {
                playerOneUsedMovedId = playerOneActivePokemon.pokemon.moves?.find(m => m._id?.toString() === battleObj.player1Move?.moveId)
            }

            if (!switchResult.playerTwoSwitchedOut) {
                playerTwoUsedMovedId = playerTwoActivePokemon.pokemon.moves?.find(m => m._id?.toString() === battleObj.player2Move?.moveId)
            }

            debugger


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
                }

                else {


                    const player2Damage = Math.floor(this.calculateDamage(playerTwoMoveUsed!, playerTwoActivePokemon, playerOneActivePokemon))
                    playerOneActivePokemon.remainingHealth = playerOneActivePokemon.remainingHealth - player2Damage

                    if (playerOneActivePokemon.remainingHealth <= 0) {
                        playerOneActivePokemon.isActive = false
                        playerOneActivePokemon!.status!.primary = PrimaryStatus.Faint
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
                }

                else {

                    const playerOneMoveUsed = await MoveModel.findById(playerOneUsedMovedId)
                    const player1Damage = this.calculateDamage(playerOneMoveUsed!, playerOneActivePokemon, playerTwoActivePokemon)
                    playerTwoActivePokemon.remainingHealth = playerTwoActivePokemon.remainingHealth - player1Damage

                    if (playerTwoActivePokemon.remainingHealth <= 0) {
                        playerTwoActivePokemon.isActive = false
                        playerTwoActivePokemon!.status!.primary = PrimaryStatus.Faint
                    }

                }


            }
            battleObj.player1Move = null
            battleObj.player2Move = null

            // in case of poison, sleep, or burn, we need to apply the status effect

            // player one switched out
            this.publishBattleUpdate(battleObj, switchResult, playerOneMovedFirst, playerOneMoveUsed, playerTwoMoveUsed)

        }

        else {
            return "waiting for moves"
        }



    }


    publishBattleUpdate(battleObj: BattleObj, switchResult: switchResult ,  playerOneMovedFirst: boolean, playerOneMoveUsed: Move | null, playerTwoMoveUsed: Move | null) {
        const battleUpdate = new BattleUpdate()
            battleUpdate.battleId = battleObj.battle.id
            battleUpdate.playerOneChangedPokemon = new BattleTeam()
            battleUpdate.playerOneChangedPokemon.userId = battleObj.battle.team1.userId
            battleUpdate.playerOneChangedPokemon.pokemonInBattle = [switchResult.playerOneActivePokemon, ...switchResult.otherChangedPokemonPlayerOne]
            battleUpdate.playerTwoChangedPokemon = new BattleTeam()
            battleUpdate.playerTwoChangedPokemon.userId = battleObj.battle.team2.userId
            battleUpdate.playerTwoChangedPokemon.pokemonInBattle = [switchResult.playerTwoActivePokemon, ...switchResult.otherChangedPokemonPlayerTwo]
            battleUpdate.environment = battleObj.battle.environment
            battleUpdate.playerOneMovedFirst = playerOneMovedFirst
            battleUpdate.playerOneFreeSwitch = switchResult.playerOneSwitchedOut
            battleUpdate.playerTwoFreeSwitch = switchResult.playerTwoSwitchedOut
            battleUpdate.playerOneMoveUsed = playerOneMoveUsed
            battleUpdate.playerTwoMoveUsed = playerTwoMoveUsed


            pubsub.publish(Topic.BATTLE_UPDATE, battleUpdate)
    }

    calculateDamage(move: Move, attacker: PokemonInBattle, defender: PokemonInBattle) {
        if (!move) {
            return 0
        }

        const attackerAttack = attacker.pokemon.stats?.attack || 0;
        const defenderDefense = defender.pokemon.stats?.defense || 1;
        const damage = (move.basePower || 0) * attackerAttack / defenderDefense;

        return damage;
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
            return playerOneActivePokemon
        }
        else if (playerTwoActivePokemon?.pokemon?.stats?.speed < playerOneActivePokemon?.pokemon?.stats?.speed) {
            return playerTwoActivePokemon
        }
        else {
            const random = Math.random()
            if (random < 0.5) {
                return playerOneActivePokemon
            } else {
                return playerTwoActivePokemon
            }
        }





    }


    async handleSwitch(moveInput1: MoveInput, moveInput2: MoveInput, playerId: string, battleObj: BattleObj): Promise<switchResult> {

        debugger
        // return active pokemon and switched out pokemon if it exists, therefore we return an array of two pokemon

        const playerTeam = playerId === battleObj.battle.team1.userId ? battleObj.battle.team1 : battleObj.battle.team2
        const enemyTeam = playerId === battleObj.battle.team1.userId ? battleObj.battle.team2 : battleObj.battle.team1

        let currentPokemon = playerTeam.pokemonInBattle.find(p => p.pokemon?._id?.toString() === moveInput1.pokemonId)

        currentPokemon = playerTeam.pokemonInBattle[0]
        let currentPokemonSpeed = currentPokemon?.pokemon.stats?.speed
        let enemyCurrentPokemon = enemyTeam.pokemonInBattle.find(p => p.pokemon?._id?.toString() === moveInput2.pokemonId)

        let enemyCurrentPokemonSpeed = enemyCurrentPokemon?.pokemon.stats?.speed

        debugger

        if (!currentPokemon || !enemyCurrentPokemon) {
            throw new Error("Pokemon not found")
        }

        // switch out current pokemon player team

        if (!moveInput1.isMove) {

            // switch out current pokemon player team
            currentPokemon.isActive = false
            currentPokemon = playerTeam.pokemonInBattle.find(p => p.pokemon._id?.toString() === moveInput1.switchPokemonId)
            if (!currentPokemon) {
                throw new Error("Pokemon not found")
            }
            currentPokemon.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }

            // handle other switch in effects here
        }

        if (!moveInput2.isMove) {

            // switch out current pokemon enemy team
            enemyCurrentPokemon.isActive = false
            enemyCurrentPokemon = enemyTeam.pokemonInBattle.find(p => p.pokemon._id?.toString() === moveInput2.switchPokemonId)
            if (!enemyCurrentPokemon) {
                throw new Error("Pokemon not found")
            }
            enemyCurrentPokemon.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 }
        }

        let playerOneMovedFirst = false

        if (currentPokemonSpeed && enemyCurrentPokemonSpeed && currentPokemonSpeed > enemyCurrentPokemonSpeed) {
            playerOneMovedFirst = true
        } else {
            playerOneMovedFirst = false
        }

        const otherChangedPokemonPlayerOne: PokemonInBattle[] = []
        const otherChangedPokemonPlayerTwo: PokemonInBattle[] = []

        return {
            playerOneMovedFirst, playerOneActivePokemon: currentPokemon
            , playerTwoActivePokemon: enemyCurrentPokemon, otherChangedPokemonPlayerOne, otherChangedPokemonPlayerTwo,
            playerOneSwitchedOut: !moveInput1.isMove, playerTwoSwitchedOut: !moveInput2.isMove
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
            }
            pokeArr[0].isActive = true
        }

        const environment: Environment = {}

        const battle = new Battle()
        battle.environment = environment
        battle.team1 = { pokemonInBattle: pokemonInBattleArr[0], userId: "67abe4c8201f9cd643c552bf" }
        battle.team2 = { pokemonInBattle: pokemonInBattleArr[1], userId: "67b957d50ca31da275063b3b" }
        battle.id = "1"
        this.battleMap.set("1", { battle: battle, player1Move: null, player2Move: null })
        return battle





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
