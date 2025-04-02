import { Battle } from "./Battle";
import { MoveInput } from "./MoveInput";

export class BattleObj {
    private _battle: Battle;
    private _playerMoves: MoveInput[];
  
    constructor(battle: Battle, playerMoves: MoveInput[]) {
      this._battle = battle;
      this._playerMoves = playerMoves;
    }
  
    get battle(): Battle {
      return this._battle;
    }
  
    get playerMoves(): MoveInput[] {
      return this._playerMoves;
    }
  
    public set battle(battle:Battle) {
        this._battle = battle;
    }
  
    setPlayerMoves(moves: MoveInput[]): void {
      this._playerMoves = moves;
    }
  
    addPlayerMove(move: MoveInput): void {
      this._playerMoves.push(move);
    }
  
    clearMoves(): void {
      this._playerMoves = [];
    }
  
    hasMoves(): boolean {
      return this._playerMoves.length > 0;
    }
  }
  