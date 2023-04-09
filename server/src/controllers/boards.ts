import { Response, NextFunction } from "express";
import BoardModel from "../models/board";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";

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