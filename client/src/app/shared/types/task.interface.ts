export interface TaskInterface {
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    boardId: string;
    columnId: string;
}