import { Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";

export const getTasks = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if(!(req.user)) {
            return res.sendStatus(401);
        }
        const tasks = await TaskModel.find({ boardId: req.params.boardId }); //We're grabbing every task for the board, and we'll render it by column client side
        console.log('tasks',tasks);
        res.send(tasks);
    } catch (err) {
        next(err);
    }
}

export const createTask = async (io: Server, socket: Socket, data: {boardId: string; columnId: string; title: string;}) => { //description isn't included, as it will be done via update
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.tasksCreateFailure,
                'User not authorized'
            );
            return;
        }
        const newTask = new TaskModel({
            title: data.title,
            boardId: data.boardId,
            columnId: data.columnId,
            userId: socket.user.id,
        });
        const savedTask = await newTask.save();
        io.to(data.boardId).emit(
            SocketEventsEnum.tasksCreateSuccess,
            savedTask
        );
        console.log('savedTask', savedTask);
    } catch (err) {//using a helper function to convert unknown erro messages to strings
        socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(err));
    }
}