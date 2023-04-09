import { Request } from "express";
import { BoardDocument } from "./board.interface";
import { UserDocument } from "./user.interface";

export interface ExpressRequestInterface 
    extends Request {
        user?: UserDocument,
}