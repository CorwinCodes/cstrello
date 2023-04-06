import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from 'cors';

import * as usersController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import authMiddleware from "./middlewares/auth";
import { mongoPass } from "./creds/mongoPass";
import { mongoUser } from "./creds/mongoUser";
import { SocketEventsEnum } from "./types/socketEvents.enum";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', //replace with just host of the domain for safety
    },
});
const port = 4001;
const connectionString = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0.mkp2adm.mongodb.net/?retryWrites=true&w=majority`
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
//test app
app.get('/', (req, res) => {
    res.send('API is UP');
});

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/boards', authMiddleware, boardsController.getBoards);
app.post('/api/boards', authMiddleware, boardsController.createBoard);
app.get('/api/boards/:boardId', authMiddleware, boardsController.getBoard);

mongoose.set("toJSON", { //make notes on removing the underscore from returned id
    virtuals: true, //we can create virtual properties in mongoose and they aren't returned by default, but this changes it
    transform: (_, converted) => {
        delete converted._id;
    },
})

io.on('connection', (socket) => {
    socket.on(SocketEventsEnum.boardsJoin, (data) => {
       boardsController.joinBoard(io, socket, data); //note that sockets can still be handled in the relevent controller by passing it whatever is needed (io included) for MVC style 
    });

    socket.on(SocketEventsEnum.boardsLeave, (data) => {
        boardsController.leaveBoard(io, socket, data); //note that sockets can still be handled in the relevent controller by passing it whatever is needed (io included) for MVC style 
     });
});
//put server inside mongoose connect to prevent trying to do anything wihtout db connection
mongoose.connect(connectionString).then(() => {
    console.log("connected to mongodb atlas")
    httpServer.listen(port, ()=> {
        console.log(`API is listening on port ${port}`);
    });
})
