import { Document, Schema } from "mongoose";

export interface Board {
    title: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Schema.Types.ObjectId; //note this is from mongoose
}

export interface BoardDocument extends Document, Board {}