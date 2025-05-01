import { v4 as uuidv4 } from 'uuid';
import { checkUserExistance, isReponseError, validateId, validateReqBody } from './utils.ts';
import { IUser, statusCodes } from './types.ts';
import type { ServerResponse, IncomingMessage } from 'node:http';

let users: IUser[] = [];

const getUsers = async (res: ServerResponse) => {
  res.writeHead(statusCodes.OK, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
}

const getUserById = async (res: ServerResponse, id: string) => {
  if (!validateId(res, id)) return;
  const response = checkUserExistance(id, users);
  const statusCode = Array.isArray(response) ? statusCodes.OK : statusCodes.NOT_FOUND;
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
}

const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  let body = '';
  req.on('data', (chunk: Buffer) => body += chunk.toString());
  req.on('end', () => {
    try {
      const userObj = JSON.parse(body);
      const response = validateReqBody(userObj);
      const statusCode = response.length === 0 ? statusCodes.CREATED : statusCodes.BAD_REQUEST;
      const user = { id: uuidv4(), ...userObj }
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statusCode === statusCodes.CREATED ? user : response));
      if (statusCode === 201) {
        users.push(user);
      }
    } catch {
      res.writeHead(statusCodes.BAD_REQUEST, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Request body is not valid" }));
    }
  })
}

const updateUserById = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  if (!validateId(res, id)) return;
  const response = checkUserExistance(id, users);
  let statusCode = isReponseError(response) ? statusCodes.NOT_FOUND : statusCodes.OK;
  if (statusCode === statusCodes.NOT_FOUND) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }
  let body = '';
  req.on('data', (chunk: Buffer) => body += chunk.toString());
  req.on('end', () => {
    const userObj: IUser = { id, ...JSON.parse(body) };
    const reqBodyValidationResponse = validateReqBody(userObj);
    statusCode = reqBodyValidationResponse.length === 0 ? statusCodes.OK : statusCodes.BAD_REQUEST;
    users = users.map((user) => {
      if (user.id === id) {
        return userObj;
      }
      return user;
    })
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(statusCode === statusCodes.OK ? userObj : reqBodyValidationResponse));
  })
}

const deleteUserById = async (res: ServerResponse, id: string) => {
  if (!validateId(res, id)) return;
  const response = checkUserExistance(id, users);
  const statusCode = isReponseError(response) ? statusCodes.NOT_FOUND : statusCodes.DELETED;
  users = users.filter((user) => user.id !== id);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
}

export { getUsers, getUserById, createUser, deleteUserById, updateUserById };