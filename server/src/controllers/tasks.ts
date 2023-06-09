import { Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
import { SortOrder } from 'mongoose';

export const getTasks = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if(!(req.user)) {
            return res.sendStatus(401);
        }
        //handle some sort params
        const sort: { [key: string]: SortOrder } = {};
        if (req.query.sort) {
            (req.query.sort as string).split(',').forEach((field: string) => {
                sort[field] = 'asc';//this sets ascending vs descending order
            });
        }

        const tasks = await TaskModel.find({ boardId: req.params.boardId }).sort(sort); //We're grabbing every task for the board, and we'll render it by column client side
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

export const updateTask = async (io: Server, socket: Socket, data: {taskId: string; boardId: string; fields: {title?: string; description?: string; columnId?: string};}) => {
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.tasksUpdateFailure,
                'User not authorized'
            );
            return;
        }
        const updatedTask = await TaskModel.findByIdAndUpdate(
            data.taskId,
            data.fields,
            { new: true }
        );
        io.to(data.boardId).emit(
            SocketEventsEnum.tasksUpdateSuccess,
            updatedTask
        );
    } catch (err) {
        socket.emit(SocketEventsEnum.tasksUpdateFailure, getErrorMessage(err));
    }
}

export const deleteTask = async (io: Server, socket: Socket, data: {boardId: string; taskId: string}) => {
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.tasksDeleteFailure,
                'User not authorized'
            );
            return;
        }
        await TaskModel.deleteOne({_id: data.taskId});
        io.to(data.boardId).emit(
            SocketEventsEnum.tasksDeleteSuccess,
            data.taskId
        );
    } catch (err) {
        socket.emit(SocketEventsEnum.tasksDeleteFailure, getErrorMessage(err));
    }
}