import {Game, gameParticipant,whiteOrBlack} from "./Game"
import { INIT_MESSAGE, MOVE } from "./messages"
import {User} from "./User"
import { WebSocket } from "ws"


export class GameManager {
    private games: Game[]
    private pendingUser: gameParticipant|undefined
    private Users:User[]
    public gamesCount:number
    constructor() {
        this.games = []
        this.Users = []
        this.gamesCount = 0
    }

    public addUser(webSocket:WebSocket,name:string){
        this.Users.push(new User(name,Date.now(),webSocket))
        this.gameSettingHandler(webSocket)
    }
    public removeUser(webSocket:WebSocket){
        this.Users = this.Users.filter((user)=> user.webSocket!= webSocket)
    }
    public gameSettingHandler(webSocket:WebSocket){
        webSocket.on('message',(data)=>{
            const msg = JSON.parse(data.toString())
            if(msg.type=== INIT_MESSAGE){
                if(this.pendingUser){
                    this.gamesCount++
                    const newGame = new Game(this.pendingUser,{webSocket,playerType:whiteOrBlack.Black},this.gamesCount)
                    this.games.push(newGame)
                    this.pendingUser = undefined
                    // console.log(this.games)
                }
                else{
                    this.pendingUser = {webSocket: webSocket,playerType: whiteOrBlack.White }
                    console.log("made a pending user")
                }
            }
            else if(msg.type===MOVE){
                const game = this.games.find((game)=> game.gameId === msg.gameId)
                if(game){
                    const participant = game.participant1.webSocket === webSocket ? game.participant1 : game.participant2
                    game.movePawn(participant,msg.move)
                }
                else{
                    console.log("no such game")
                }
            }
        })
    }

}