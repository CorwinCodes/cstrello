import { Schema, model } from "mongoose";
import { BoardDocument } from "../types/board.interface";

import Column from "./column";
import Task from "./task";
import { getErrorMessage } from "../helpers";

const boardSchema = new Schema<BoardDocument>({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
},
{timestamps: true}
);

// Middleware to remove associated tasks and columns before removing a board
boardSchema.pre('deleteOne', async function (next) { //remove is deprecated so we need deleteOne here. It also requires we delete in a specific manner in the controller. 'findOneAndDelete' is treated as a different event
    try {
        const filter = this.getFilter();
        await Task.deleteMany({ boardId: filter._id });
        await Column.deleteMany({ boardId: filter._id });
        next();
    } catch (err) {
        next(new Error(getErrorMessage(err)));
    }
});

export default model<BoardDocument>("Board", boardSchema);