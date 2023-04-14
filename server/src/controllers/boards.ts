import { Response, NextFunction } from "express";
import BoardModel from "../models/board";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";

export const getBoards = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if(!req.user) {
            return res.sendStatus(401);
        }
        const boards = await BoardModel.find({ userId: req.user.id }); //this is filtering the list by userId but should get multiple boards
        res.send(boards);
    } catch (err) {
        next(err);
    }
}

export const createBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction,
) => {
    try {
        if(!req.user) {
            return res.sendStatus(401);
        }
        const newBoard = new BoardModel({
            title: req.body.title,
            userId: req.user.id, //remember this is from middleware
        });
        const savedBoard = await newBoard.save();
        res.send(savedBoard);
    } catch (err) {
        next(err);
    }
}

export const getBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if(!req.user) {
            return res.sendStatus(401);
        }
        const board = await BoardModel.findById(req.params.boardId);
        return res.send(board);
    } catch (err) {
        next(err);
    }
}

export const joinBoard = (io: Server, socket: Socket, data: {boardId: string}) => { //double check the Server for io is from socket.io
    console.log('server socket io join board', data.boardId);
    console.log('socket user:', socket.user);
    socket.join(data.boardId);
}

export const leaveBoard = (io: Server, socket: Socket, data: {boardId: string}) => {
    console.log('server socket io leave', data.boardId);
    socket.leave(data.boardId);
}

export const updateBoard = async (io: Server, socket: Socket, data: {boardId: string; fields: {title: string};}) => {
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.boardsUpdateFailure,
                'User not authorized'
            );
            return;
        }
        const updatedBoard = await BoardModel.findByIdAndUpdate(
            data.boardId,
            data.fields,
            { new: true }
        );
        io.to(data.boardId).emit(
            SocketEventsEnum.boardsUpdateSuccess,
            updatedBoard
        );
    } catch (err) {//using a helper function to convert unknown erro messages to strings
        socket.emit(SocketEventsEnum.boardsUpdateFailure, getErrorMessage(err));
    }
}

export const deleteBoard = async (io: Server, socket: Socket, data: {boardId: string}) => {
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.boardsDeleteFailure,
                'User not authorized'
            );
            return;
        }//findByIdAndDelete is a great shortcut for deleting children, but for parents we need deleteOne to trigger the filter and prehooks that can clean up child entities like tasks and columns
        await BoardModel.deleteOne({_id: data.boardId}); //to get this to delete associated columns and tasks we need it to trigger a pre hook in the model, and to do that it needs to be in this object form to be passed as the appropriate filter, _id or id are interchangeable
        io.to(data.boardId).emit(
            SocketEventsEnum.boardsDeleteSuccess
        );
    } catch (err) {//using a helper function to convert unknown erro messages to strings
        socket.emit(SocketEventsEnum.boardsDeleteFailure, getErrorMessage(err));
    }
}