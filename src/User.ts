import { WebSocket } from "ws"
export class User{
    private name:string
    private id: number
    public webSocket :WebSocket

    constructor(name:string,id: number,webSocket :WebSocket){
        this.id = id
        this.name = name
        this.webSocket = webSocket
    }

}