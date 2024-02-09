import { validate } from "uuid";
import { IUser } from './types.ts';

const invalidUserIdErrMsg = { message: 'User ID is not valid' };
const userNotExistErrMsg = { message: "User with provided ID doesn't exist" };
const missingRequiredFieldsErrMsg = { message: "Request body doesn't contain following required field(s): " }

const validateId = (res: any, id: string) => {
  if (!validate(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(invalidUserIdErrMsg));
    return false;
  };
  return true;
}

const checkUserExistance = (id: string, userArr: IUser[]) => {
  const user = userArr.filter((user: IUser) => user.id === id);
  return user.length === 1 ? user : userNotExistErrMsg;
}

const validateReqBody = (body: IUser) => {
  const requiredFields = ['username', 'age', 'hobbies'];
  const bodyFields = Object.keys(body);
  const missingFields = requiredFields.filter((field) => !bodyFields.includes(field));
  return missingFields.length > 0 ? missingRequiredFieldsErrMsg.message + missingFields.join(', ') : '';
}

export { validateId, checkUserExistance, validateReqBody };