import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8000 });
const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    // ws.on('message', (message) => {
    //     // const msg = JSON.parse(message.toString());
    //     // if (msg.type === "init_game") {
    //     //     gameManager.addUser(ws, "");
    //     // }
    //   });
      

    // ws.on('close', () => {
    //     gameManager.removeUser(ws);
    // });

    ws.on('error', console.error);
    gameManager.gameSettingHandler(ws)
});
