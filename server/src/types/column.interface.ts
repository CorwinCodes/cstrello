import { Document, Schema } from "mongoose";

export interface Column {
    title: string;
    userId: Schema.Types.ObjectId;
    boardId: Schema.Types.ObjectId;
}

export interface ColumnDocument extends Document, Column {}