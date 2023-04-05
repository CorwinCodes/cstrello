import { Response, NextFunction } from "express";
import BoardModel from "../models/board";
import { Board } from "../types/board.interface";
import { ExpressRequestInterface } from "../types/expressRequest.interface";

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
    } catch (err) {
        next(err);
    }
}