import crypto from 'crypto'
import { WebSocket } from "ws"
import { INIT_MESSAGE,GAME_OVER,CHECK,MOVE } from "./messages"
import { Chess, Move } from "chess.js";


export enum whiteOrBlack {
    White = "w",
    Black = "b"
}

export interface gameParticipant{
    webSocket : WebSocket
    playerType: whiteOrBlack
}
export class Game {
    public gameId:string
    public participant1: gameParticipant
    public participant2: gameParticipant
    public moves:Move[]
    public state: string
    public startTime : Date
    public chess:Chess;
    constructor(participant1: gameParticipant,participant2: gameParticipant,gameId:number){
        this.participant1 = participant1;
        this.participant2 = participant2;
        this.moves = [];
        this.state = " ";
        this.startTime = new Date()
        const hash = crypto.createHash('sha256').update(`${Date.now()}${gameId}`).digest('hex');
        this.gameId = hash
        this.chess = new Chess()
        console.log(JSON.stringify({game:this.gameId}))
        this.participant1.webSocket.send(JSON.stringify({
            type: INIT_MESSAGE,
            payload: {
                color: this.participant1.playerType
            },
            gameId:this.gameId
        }))
        this.participant2.webSocket.send(JSON.stringify({
            type: INIT_MESSAGE,
            payload: {
                color: this.participant2.playerType
            },
            gameId:this.gameId
        }))

    }
    public movePawn(participant: gameParticipant,move:{from:string,to:string}){
        try {
            if((this.chess.turn() === "w" && participant.playerType == "b" && this.moves.length %2 === 0) || (this.chess.turn() === "b" && participant.playerType == "w" && this.moves.length %2 === 1)){
                // console.log(participant)
                console.log("incorrect move")
                return
            }
            else{
                console.log(JSON.stringify({move:move,gameId:this.gameId}))
                const result = this.chess.move(move)
                this.state = this.chess.fen()
                // if(this.chess.turn() === "b"){
                //     if(this.participant2.playerType === "b"){
                //         this.participant2.webSocket.send(this.state)
                //     }
                //     else{
                //         this.participant1.webSocket.send(this.state)
                //     }
                // }
                // else{
                //     if(this.participant1.playerType === "w"){
                //         this.participant1.webSocket.send(this.state)
                //     }
                //     else{
                //         this.participant2.webSocket.send(this.state)
                //     }
                // }
                this.participant1.webSocket.send(JSON.stringify({
                    type:MOVE,
                    payload:result
                }))
                this.participant2.webSocket.send(JSON.stringify({
                    type:MOVE,
                    payload:result
                }))
                if(result){
                    this.moves.push(result)
                }
            }
            
        } catch (error) {
            if(this.chess.isCheck()){
                if(this.chess.turn() === "b"){
                    if(this.participant2.playerType === "b"){
                        this.participant2.webSocket.send(JSON.stringify({
                            type:CHECK,
                        }))
                    }
                    else{
                        this.participant1.webSocket.send(JSON.stringify({
                            type:CHECK,
                        }))
                    }
                }
                else{
                    if(this.participant1.playerType === "w"){
                        this.participant1.webSocket.send(JSON.stringify({
                            type:CHECK,
                        }))
                    }
                    else{
                        this.participant2.webSocket.send(JSON.stringify({
                            type:CHECK,
                        }))
                    }
                }
            }
            else{
                console.log("There is no such move")
            }
            return;
        }
        if(this.chess.isGameOver()){
            if(this.chess.isCheckmate()){
                this.participant1.webSocket.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.chess.turn() === "w" ? "b" : "w" 
                    }
                }))
                this.participant2.webSocket.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.chess.turn() === "w" ? "b" : "w" 
                    }
                }))
            }
            else if(this.chess.isStalemate()){
                this.participant1.webSocket.send(JSON.stringify({
                    type:"Stale Mate",
                    payload:{
                        draw:true
                    }
                }))
                this.participant2.webSocket.send(JSON.stringify({
                    type:"Stale Mate",
                    payload:{
                        draw:true
                    }
                }))
            }
            else if(this.chess.isDraw() || this.chess.isInsufficientMaterial() || this.chess.isThreefoldRepetition()){
                this.participant1.webSocket.send(JSON.stringify({
                    type:"Draw",
                    payload:{
                        draw:true
                    }
                }))
                this.participant2.webSocket.send(JSON.stringify({
                    type:"Draw",
                    payload:{
                        draw:true
                    }
                }))
            }
        }
    }
}
