export enum SocketEventsEnum { //don't forget to match to server
    boardsJoin = "boards:join",
    boardsLeave = "boards:leave",
    boardsUpdateStart = "boards:updateStart",
    boardsUpdateSuccess = "boards:updateSuccess",
    boardsUpdateFailure = "boards:updateFailure",
    boardsDeleteStart = "boards:deleteStart",
    boardsDeleteSuccess = "boards:deleteSuccess",
    boardsDeleteFailure = "boards:deleteFailure",
    columnsCreateStart = "colums:createStart",
    columnsCreateSuccess = "colums:createSuccess",
    columnsCreateFailure = "colums:createFailure",
    columnsDeleteStart = "columns:deleteStart",
    columnsDeleteSuccess = "columns:deleteSuccess",
    columnsDeleteFailure = "columns:deleteFailure",
    columnsUpdateStart = "columns:updateStart",
    columnsUpdateSuccess = "columns:updateSuccess",
    columnsUpdateFailure = "columns:updateFailure",
    tasksCreateStart = "tasks:createStart",
    tasksCreateSuccess = "tasks:createSuccess",
    tasksCreateFailure = "tasks:createFailure",
    tasksDeleteStart = "tasks:deleteStart",
    tasksDeleteSuccess = "tasks:deleteSuccess",
    tasksDeleteFailure = "tasks:deleteFailure",
    tasksUpdateStart = "tasks:updateStart",
    tasksUpdateSuccess = "tasks:updateSuccess",
    tasksUpdateFailure = "tasks:updateFailure",
}