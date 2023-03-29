import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from 'cors';

import * as usersController from './controllers/users'
import authMiddleware from "./middlewares/auth";
import { mongoPass } from "./creds/mongoPass";
import { mongoUser } from "./creds/mongoUser";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 4001;
const connectionString = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0.mkp2adm.mongodb.net/?retryWrites=true&w=majority`
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
//test app
app.get('/', (req, res) => {
    res.send('API is UP')
});

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser )

io.on('connection', () => {
    console.log("connect");
});
//put server inside mongoose connect to prevent trying to do anything wihtout db connection
mongoose.connect(connectionString).then(() => {
    console.log("connected to mongodb atlas")
    httpServer.listen(port, ()=> {
        console.log(`API is listening on port ${port}`);
    });
})
