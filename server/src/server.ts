import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "./types/socket.interface";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from 'cors';
import jwt from 'jsonwebtoken';


import * as usersController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import * as columnsController from "./controllers/columns";
import * as tasksController from "./controllers/tasks";
import authMiddleware from "./middlewares/auth";
import { SocketEventsEnum } from "./types/socketEvents.enum";
import userModel from "./models/user";
import { envs } from '../config'; //get configuration from .env or process if deployed

const port: number = parseInt(envs.PORT);
const connectionString: string = envs.MONGO_URI;
const secret: string = envs.JWT_SECRET;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', //replace with just host of the domain for safety
    },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
if(envs.SERVE_FRONTEND === 'true'){
    app.use('/', express.static('../../client/dist/client'));
}

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/boards', authMiddleware, boardsController.getBoards);
app.post('/api/boards', authMiddleware, boardsController.createBoard);
app.get('/api/boards/:boardId', authMiddleware, boardsController.getBoard);
app.get('/api/boards/:boardId/columns', authMiddleware, columnsController.getColumns);
app.get('/api/boards/:boardId/tasks', authMiddleware, tasksController.getTasks);

mongoose.set("toJSON", { //make notes on removing the underscore from returned id
    virtuals: true, //we can create virtual properties in mongoose and they aren't returned by default, but this changes it
    transform: (_, converted) => {
        delete converted._id;
    },
})

io.use(
    async (socket: Socket, next ) => {
        try {
            const token = (socket.handshake.auth.token as string) ?? "";
            const data = jwt.verify(token.split(' ')[1], secret) as {
                id: string;
                email: string;
            };
            const user = await userModel.findById(data.id);
            if (!user) {
                return next(new Error("Authentication error"));
            }
            socket.user = user; //sockets can hold data in custom properties like this if we extend them
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    }
).on('connection', (socket) => {
    socket.on(SocketEventsEnum.boardsJoin, (data) => {
       boardsController.joinBoard(io, socket, data); //note that sockets can still be handled in the relevent controller by passing it whatever is needed (io included) for MVC style 
    });

    socket.on(SocketEventsEnum.boardsLeave, (data) => {
        boardsController.leaveBoard(io, socket, data);
    });

    socket.on(SocketEventsEnum.columnsCreateStart, (data) => {
        columnsController.createColumn(io, socket, data); 
    });

    socket.on(SocketEventsEnum.tasksCreateStart, (data) => {
        tasksController.createTask(io, socket, data); 
    });

    socket.on(SocketEventsEnum.boardsUpdateStart, (data) => {
        boardsController.updateBoard(io, socket, data);
    });

    socket.on(SocketEventsEnum.boardsDeleteStart, (data) => {
        boardsController.deleteBoard(io, socket, data);
    });

    socket.on(SocketEventsEnum.columnsDeleteStart, (data) => {
        columnsController.deleteColumn(io, socket, data);
    });

    socket.on(SocketEventsEnum.columnsUpdateStart, (data) => {
        columnsController.updateColumn(io, socket, data);
    });

    socket.on(SocketEventsEnum.tasksUpdateStart, (data) => {
        tasksController.updateTask(io, socket, data);
    });

    socket.on(SocketEventsEnum.tasksDeleteStart, (data) => {
        tasksController.deleteTask(io, socket, data);
    });
});
//put server inside mongoose connect to prevent trying to do anything wihtout db connection
mongoose.connect(connectionString).then(() => {
    console.log("connected to mongodb atlas")
    httpServer.listen(port, ()=> {
        console.log(`API is listening on port ${port}`);
    });
})
