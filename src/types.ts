interface IUser {
    id?: string,
    username: string,
    age: number,
    hobbies: string[]
}

enum statusCodes {
    OK = 200,
    CREATED = 201,
    DELETED = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
}

type errorMessageType = {
    message: string
}

type responseType = IUser | errorMessageType;

export { IUser, statusCodes, errorMessageType, responseType };