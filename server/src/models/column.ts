import { Schema, model } from "mongoose";
import { ColumnDocument } from "../types/column.interface";
import Task from "./task";
import { getErrorMessage } from "../helpers";

const columnSchema = new Schema<ColumnDocument>({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    boardId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
});

columnSchema.pre('deleteOne', async function (next) { //remove is deprecated so we need deleteOne here. It also requires we delete in a specific manner in the controller. 'findOneAndDelete' is treated as a different event
    try {
        const filter = this.getFilter();
        await Task.deleteMany({ columnId: filter._id });
        next();
    } catch (err) {
        next(new Error(getErrorMessage(err)));
    }
});

export default model<ColumnDocument>("Column", columnSchema)

