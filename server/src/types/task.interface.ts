import { Document, Schema } from "mongoose";

export interface Task {
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Schema.Types.ObjectId;
    boardId: Schema.Types.ObjectId;
    columnId: Schema.Types.ObjectId;
    order: number;
}

export interface TaskDocument extends Document, Task {}