import { Chess } from "chess.js";
import { gameParticipant } from "./Game";
import { GAME_OVER } from "./messages";

export class ChessManager{
    public chess:Chess;
    constructor(){
       this.chess = new Chess()
    }

    public movePawn(participant: gameParticipant,move:{from:string,to:string}){
        try {
            if((this.chess.turn() === "w" && participant.playerType == "b" && this.chess.moves.length %2 === 0) || (this.chess.turn() === "b" && participant.playerType == "w" && this.chess.moves.length %2 === 1)){
                // console.log(participant)
                console.log("incorrect move")
                return
            }
            else{
                const result = this.chess.move(move)
                if(this.chess.isGameOver()){
                    participant.webSocket.emit(JSON.stringify({
                        type: GAME_OVER,
                        payload: {
                            winner: this.chess.turn() === "w" ? "b" : "w" 
                        }
                    }))
                }
            }
            
        } catch (error) {
            console.log("something went wrong")
            return;
        }
    }

}