import { Response, NextFunction } from "express";
import BoardModel from "../models/board";
import { Board } from "../types/board.interface";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Server, Socket } from "socket.io";

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
    console.log('server socket io join', data.boardId);
    socket.join(data.boardId);
}

export const leaveBoard = (io: Server, socket: Socket, data: {boardId: string}) => {
    console.log('server socket io leave', data.boardId);
    socket.leave(data.boardId);
}