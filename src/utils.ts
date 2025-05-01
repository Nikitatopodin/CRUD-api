import { validate } from "uuid";
import { errorMessageType, IUser, responseType } from './types.ts';
import type { ServerResponse } from 'node:http';

const errorMessages = {
  INVALID_USER_ID: { message: 'User ID is not valid' },
  USER_NOT_EXIST: { message: "User with provided ID doesn't exist" },
  MISSING_REQUIRED_FIELD: { message: "Request body doesn't contain following required field(s): " }
}

const validateId = (res: ServerResponse, id: string) => {
  if (!validate(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorMessages.INVALID_USER_ID));
    return false;
  };
  return true;
}

const checkUserExistance = (id: string, userArr: IUser[]): IUser | errorMessageType  => {
  const user = userArr.find((user: IUser) => user.id === id);
  return user || errorMessages.USER_NOT_EXIST;
}

const validateReqBody = (body: IUser) => {
  const requiredFields = ['username', 'age', 'hobbies'];
  const bodyFields = Object.keys(body);
  const missingFields = requiredFields.filter((field) => !bodyFields.includes(field));
  return missingFields.length > 0 ? errorMessages.MISSING_REQUIRED_FIELD.message + missingFields.join(', ') : '';
}

const isReponseError = (response: responseType) => {
  return "message" in response && response.message
}

export { validateId, checkUserExistance, validateReqBody, isReponseError };