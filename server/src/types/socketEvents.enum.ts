export enum SocketEventsEnum { //don't forget to match to client exactly
    boardsJoin = "boards:join",
    boardsLeave = "boards:leave",
    columnsCreateStart = "colums:createStart",
    columnsCreateSuccess = "colums:createSuccess",
    columnsCreateFailure = "colums:createFailure",
}