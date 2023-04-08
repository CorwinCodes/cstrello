import {Socket as SocketIoSocket} from "socket.io"; //renamed to prevent name collision
import { UserDocument } from "./user.interface";

export interface Socket extends SocketIoSocket { //used Socket to avoid rewrites elsewhere to integrate the extension
    user?: UserDocument;
}