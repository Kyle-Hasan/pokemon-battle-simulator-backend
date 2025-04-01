import { mongo, Types } from "mongoose";
import { pubsub, Topic } from "../graphql/resolver/pubsub";
import { Battle } from "../models/Battle";
import { BattleUpdate, BattleUpdatePlayer } from "../models/BattleUpdatePlayer";
import { Environment } from "../models/Environment";
import { Move, MoveCategory, MoveModel } from "../models/Move";
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
import { BattleEventType, BattleTurnEvent } from "../models/BattleTurnEvent";
import { error } from "console";
import { Pokemon } from "../models/Pokemon";


export interface BattleObj {

    battle: Battle
    playerMoves: MoveInput[]
}

interface switchResult {

    playerOneActivePokemon: PokemonInBattle
    playerTwoActivePokemon: PokemonInBattle
    otherChangedPokemonPlayerOne: PokemonInBattle[]
    otherChangedPokemonPlayerTwo: PokemonInBattle[]
    movedFirstIndex: number;
    playersSwitched: boolean;

}


interface TypeEffectiveness {
    doubleDamage: number,
    halfDamage: number,
    noDamage: number;
}

interface AttackResult {
    criticalHit: boolean,
    typeEffectiveness: number,
    damage: number,
    missed: boolean,
    status?: string
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

        const battleObj = this.battleMap.get(moveInput.battleId);
        if (!battleObj) {
            throw new Error("this battle does not exist");
        }

        this.setPlayerMoves(moveInput, battleObj);

        // free switches
        const freeSwitchAvaliable = battleObj.battle.teams.filter(x => x.freeSwitch);

        if (freeSwitchAvaliable.length > 0 && battleObj.playerMoves.length === freeSwitchAvaliable.length) {

            const correspondingTeam = freeSwitchAvaliable.find((x) => x.userId === moveInput.teamId);
            if (!correspondingTeam || moveInput.isMove) {
                throw new Error("you can't make this move");
            }
            this.handleFreeSwitch(moveInput, battleObj, correspondingTeam);


        }

        else {

            const bothPlayersMoved = battleObj.playerMoves.length === battleObj.battle.teams.length;

            if (bothPlayersMoved) {

                // move inputs should have the actual pokemon on them, so this sort should be safe
                battleObj.playerMoves.sort((moveInput1, moveInput2) => this.decideWhoMovesFirst(moveInput1, moveInput2, battleObj.battle.environment));


                // add switch events and change active pokemon as needed
                this.handleSwitch(battleObj);

                battleObj.playerMoves.forEach((moveInput) => {
                    this.handleMove(battleObj, moveInput);
                });

                // end battle and declare winner if only 1 team has non-fainted pokemon
                const remainingTeams = battleObj.battle.teams.filter((team) => team.pokemonInBattle.some(pokemon => pokemon.status.primary != PrimaryStatus.Faint));
                if (remainingTeams.length == 1) {
                    // declare winner
                }
            }
        }

        // clear move inputs once they are all done
        battleObj.playerMoves = [];


    }

    handleFreeSwitch(moveInput: MoveInput, battleObj: BattleObj, correspondingTeam: BattleTeam) {

        // if any other pokemon is active, this is also invalid
        let switchIn = null;
        let otherActive = false;


        for (const pokemon of correspondingTeam.pokemonInBattle) {
            if (pokemon.isActive === true) {
                otherActive = true;
                break;
            }
            if (pokemon.pokemon._id === moveInput.switchPokemonId) {
                switchIn = pokemon;
                break;
            }
        }

        if (!switchIn || otherActive) {
            throw new Error("invalid move");
        }
        switchIn.isActive = true;

        correspondingTeam.freeSwitch = false;


    }


    mapPokemonToMoveInputs(moveInput: MoveInput, team: BattleTeam) {
        moveInput.userPokemon = team.pokemonInBattle.find(x => x.pokemon._id === moveInput.userPokemonId);
        if (!moveInput.userId) {
            throw new Error("invalid pokemon");
        }


    }

    setPlayerMoves(moveInput: MoveInput, battleObj: BattleObj) {

        const playerTeam = battleObj.battle.teams.find((x) => x.userId === moveInput.userId);
        if (!playerTeam) {
            throw new Error("this player isn't in this game");
        }

        // add the actual pokemon object to the move input so that we can access it later
        this.mapPokemonToMoveInputs(moveInput, playerTeam);

        battleObj.playerMoves.push(moveInput);




    }








    // add implementation for considering environment later. Return if it crit, effectivess and damage in that order
    calculateDamage(move: Move, attacker: PokemonInBattle, defender: PokemonInBattle, environment: Environment): AttackResult {
        if (!move || !move.accuracy) {
            return {
                damage: 0,
                missed: true,
                criticalHit: false,
                typeEffectiveness: 1
            }
        }

        const missedChange = (100 - move.accuracy) / 100;

        const missed = Math.random() < missedChange;

        if (missed) {
            return {
                damage: 0,
                missed,
                criticalHit: false,
                typeEffectiveness: 1
            }
        }


        const criticalHit = Math.random() < 0.0625;


        const getEffectiveness = this.getTypeEffectiveness(move.type as PokemonType, defender.pokemon.pokemonSpecies as PokemonSpecies);

        const attackerAttack = attacker.pokemon.stats?.attack || 0;
        const defenderDefense = defender.pokemon.stats?.defense || 1;
        const damage = (move.basePower || 0) * attackerAttack / defenderDefense * getEffectiveness;



        return {
            damage,
            missed,
            criticalHit,
            typeEffectiveness: getEffectiveness

        };
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


    // returns true if player one moves first, false if player two moves first(comapator, leave moves and env to account for priority moves, trick room, weather, etc)

    decideWhoMovesFirst(moveInput1: MoveInput, moveInput2: MoveInput, environment: Environment) {

        const activePokemon1 = moveInput1.userPokemon;
        const activePokemon2 = moveInput2.userPokemon;

        const speed1 = activePokemon1?.pokemon.stats?.speed ?? 0;
        const speed2 = activePokemon2?.pokemon.stats?.speed ?? 0;

        // deal with speed tie
        if (speed1 === speed2) {
            return Math.random() > 0.5 ? 1 : -1;
        }
        return speed2 - speed1;
    }


    async handleSwitch(battleObj: BattleObj) {

        const moves = battleObj.playerMoves;

        // add new events as needed to battle obj

        const switchMoves = moves.filter((x => !x.isMove));

        // only 2 teams(single battles) or 4(multi battles), so loop in loop is fine( alternatively make hashmap mapping ids to indexes)
        switchMoves.forEach((switchMove) => {

            const team = battleObj.battle.teams.find((x => x.userId === switchMove.userId));
            if (!team) {
                throw new Error("error");
            }
            this.createSwitchEvents(switchMove, battleObj, team);

        }

        );


    }

    createSwitchEvents(switchMove: MoveInput, battleObj: BattleObj, battleTeam: BattleTeam) {
        const switchOut = new BattleTurnEvent();
        const pokemonOut = battleTeam.pokemonInBattle.find(x => x.pokemon._id === switchMove.userPokemonId);
        if (!pokemonOut) {
            throw new Error("can't switch this pokemon");
        }
        switchOut.pokemon = pokemonOut;
        pokemonOut.isActive = false;
        switchOut.type = BattleEventType.Switch_Out;

        let species = switchOut.pokemon?.pokemon.pokemonSpecies as PokemonSpecies
        switchOut.message = `${species.name} switched out`;

        const switchIn = new BattleTurnEvent();
        const pokemonIn = battleTeam.pokemonInBattle.find(x => x.pokemon._id === switchMove.switchPokemonId);
        if (!pokemonIn) {
            throw new Error("can't switch this pokemon");
        }
        pokemonIn.isActive = true;
        switchIn.pokemon = pokemonIn;

        switchIn.type = BattleEventType.Switch_In;

        switchIn.message = `${species.name} switched in`;

        battleObj.battle.events.push(switchIn, switchOut);



    }

    handleMove(battleObj: BattleObj, playerMove: MoveInput) {

        if (!playerMove.isMove) {
            return;
        }

        const playerTeam = battleObj.battle.teams.find(team => team.userId === playerMove.userId);




        const enemyTeam = battleObj.battle.teams.filter(x => x.userId !== playerMove.userId);
        if (!playerTeam || enemyTeam.length === 0) {
            throw new Error("user team or enemy team doesn't exist");
        }

        this.createMoveEvents(playerMove, playerTeam, enemyTeam, battleObj.battle.events, battleObj.battle.environment);







    }
    // for possible implementation of multi-battles, assume there can be multiple enemy teams(might also be moves that depend on the player team so leave it here)

    async createMoveEvents(moveInput: MoveInput, playerTeam: BattleTeam, enemyTeams: BattleTeam[], movesSoFar: BattleTurnEvent[], environment: Environment) {
        const movingPokemon = moveInput.userPokemon;
        const move = movingPokemon?.pokemon.moves?.find(x => x._id === moveInput.moveId) as Move;
        if (!movingPokemon || !move) {
            throw new Error("This is not a valid");
        }
        // if the pokemon got knocked in the previous move, don't run their move
        if (movingPokemon.status?.primary === PrimaryStatus.Faint) {
            return;
        }
        // this probably needs to change for moves that hit multiple targets with no set target
        const allTargetedPokemon = this.getAllTargetPokemon(move, enemyTeams, moveInput.targetPokemonId ?? "");


        // deal with attacking moves
        if (move.category === MoveCategory.PHYSICAL || move.category === MoveCategory.SPECIAL) {
            const moveUsedEvent = new BattleTurnEvent();
            moveUsedEvent.type = BattleEventType.Damage;
            moveUsedEvent.moveUsed = move;
            moveUsedEvent.pokemon = movingPokemon;
            moveUsedEvent.message = `${movingPokemon?.pokemon.pokemonSpecies} used ${move.name}`;
            movesSoFar.push(moveUsedEvent);


            this.attackPokemon(move, movingPokemon, allTargetedPokemon, movesSoFar, environment, enemyTeams);
        }

        // implement status moves later






    }

    // this probably needs to change for moves that hit multiple targets with no set target, split into function because this could get complicated
    getAllTargetPokemon(move: Move, enemyTeams: BattleTeam[], targetPokemonId: string): PokemonInBattle[] {
        const allTargetedPokemon: PokemonInBattle[] = [];


        if (targetPokemonId) {
            enemyTeams.forEach((team => {
                const targetedPokemon = team.pokemonInBattle.find((x => x.pokemon._id === targetPokemonId));
                if (targetedPokemon) {
                    allTargetedPokemon.push(targetedPokemon);
                }
            }));
        }

        return allTargetedPokemon;

    }

    attackPokemon(move: Move, attackingPokemon: PokemonInBattle, allTargetPokemon: PokemonInBattle[], movesSoFar: BattleTurnEvent[], environment: Environment, enemyTeams: BattleTeam[]) {

        allTargetPokemon.forEach((targetPokemon) => {
            const result = this.calculateDamage(move, attackingPokemon, targetPokemon, environment);
            targetPokemon.remainingHealth = Math.max(targetPokemon.remainingHealth - result.damage, 0);
            if (result.missed) {
                const missedMessage = new BattleTurnEvent();
                missedMessage.type = BattleEventType.Missed;
                missedMessage.message = `${attackingPokemon.pokemon.pokemonSpecies} missed!`;
                movesSoFar.push(missedMessage);

            }
            else {
                // need to implement status changes that could happen like paralysis after move is used etc
                if (targetPokemon.remainingHealth === 0) {
                    targetPokemon.status.primary = PrimaryStatus.Faint;
                    const faintMessage = new BattleTurnEvent();
                    faintMessage.type = BattleEventType.Faint;
                    faintMessage.message = `${targetPokemon.pokemon.pokemonSpecies} fainted!`;
                    faintMessage.pokemon = targetPokemon;
                    movesSoFar.push(faintMessage);
                    //give the free switch to that player who's pokemon got knocked out
                    const team = enemyTeams.find((team) => team.pokemonInBattle.some(p => p.pokemon._id === targetPokemon.pokemon._id));

                    team!.freeSwitch = true;

                }
                if (result.criticalHit) {
                    const critMessage = new BattleTurnEvent();
                    critMessage.type = BattleEventType.Crit;
                    critMessage.message = `It was a critical hit!`;
                    critMessage.pokemon = targetPokemon;
                }
                const effectiveMessage = new BattleTurnEvent();
                effectiveMessage.pokemon = targetPokemon;
                if (result.typeEffectiveness >= 2) {

                    effectiveMessage.type = BattleEventType.Super_Effective;
                    effectiveMessage.message = `It was super effective!`;
                }

                if (result.typeEffectiveness > 0 && result.typeEffectiveness <= 0.5) {

                    effectiveMessage.type = BattleEventType.Ineffective;
                    effectiveMessage.message = `It not very effective...`;

                }

                if (result.typeEffectiveness === 0) {

                    effectiveMessage.type = BattleEventType.Immune;
                    effectiveMessage.message = `Had no effect`;

                }

                if (effectiveMessage.message) {
                    movesSoFar.push(effectiveMessage);
                }


            }



        });

    }


    async newBattle() {



        const team1 = await getTeamWithAllPokemonInfo("67b6a6d11eaed2e8f708c361");

        const team2 = await getTeamWithAllPokemonInfo("67b6a83a1760cc59c36f1a94");

        const teams = [team1, team2];


        const pokemonInBattleArr: PokemonInBattle[][] = [[], []];

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            const pokeArr = pokemonInBattleArr[i];

            if (team && team.pokemon) {
                for (const pokemon of team.pokemon) {
                    const newPokemonInBattle = new PokemonInBattle();

                    newPokemonInBattle.pokemon = pokemon;
                    newPokemonInBattle.isActive = false;

                    newPokemonInBattle.remainingHealth = pokemon.stats?.hp || 0;
                    newPokemonInBattle.statStages = { hp: 1, attack: 1, defense: 1, specialDefense: 1, specialAttack: 1, speed: 1 };
                    newPokemonInBattle.status = { primary: PrimaryStatus.None, confused: false };

                    pokeArr.push(newPokemonInBattle);


                }
                pokeArr[0].isActive = true;
            }

        }

        const environment: Environment = {};

        const battle = new Battle();
        battle.environment = environment;


        battle.id = "1";
        const player1 = new PlayerInfo();
        player1.id = '67abe4c8201f9cd643c552bf';
        player1.playerName = "reona";
        player1.playerAvatarURL = "";

        const player2 = new PlayerInfo();
        player2.id = '67b957d50ca31da275063b3b';
        player2.playerName = "rie";
        player2.playerAvatarURL = "";


        battle.teams = [{ pokemonInBattle: pokemonInBattleArr[0], totalPokemon: 6, userId: '67abe4c8201f9cd643c552bf', playerInfo: player1, freeSwitch: false }, { pokemonInBattle: pokemonInBattleArr[1], totalPokemon: 6, userId: '67b957d50ca31da275063b3b', playerInfo: player2, freeSwitch: false }];


        battle.turnNumber = 0;
        this.battleMap.set("1", { battle: battle, playerMoves: [] });

        const playerBattle = new PlayerBattle();
        playerBattle.id = battle.id;
        playerBattle.playerInfo = player1;
        playerBattle.enemyInfo = player2;
        playerBattle.playerTeam = battle.teams[0];
        playerBattle.enemyTeam = battle.teams[1];
        playerBattle.environment = battle.environment;
        playerBattle.turnNumber = 0;
        playerBattle.playerSwitch = false;
        playerBattle.enemySwitch = false;



        return playerBattle;


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
