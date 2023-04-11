export enum SocketEventsEnum { //don't forget to match to server
    boardsJoin = "boards:join",
    boardsLeave = "boards:leave",
    columnsCreateStart = "colums:createStart",
    columnsCreateSuccess = "colums:createSuccess",
    columnsCreateFailure = "colums:createFailure",
    tasksCreateStart = "tasks:createStart",
    tasksCreateSuccess = "tasks:createSuccess",
    tasksCreateFailure = "tasks:createFailure",
}