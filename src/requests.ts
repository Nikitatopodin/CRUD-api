import { v4 as uuidv4 } from 'uuid';
import { checkUserExistance, validateId, validateReqBody } from './utils.ts';
import { IUser } from './types.ts';
import type { ServerResponse, IncomingMessage } from 'node:http';

let users: IUser[] = [
  {
    id: '1',
    username: 'Oleg',
    age: 20,
    hobbies: ['coding', 'sport', 'kek']
  },
  {
    id: '2',
    username: 'Omega',
    age: Infinity,
    hobbies: ['life ending']
  }
]

const getUsers = async (res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
}

const getUserById = async (res: ServerResponse, id: string) => {
  if (!validateId(res, id)) return;
  const response = checkUserExistance(id, users);
  const statusCode = Array.isArray(response) ? 200 : 404;
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
      console.log(response);
      const statusCode = response.length === 0 ? 201 : 400;
      const user = { id: uuidv4(), ...userObj }
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statusCode === 201 ? user : response));
      if (statusCode === 201) {
        users.push(user);
      }
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Request body is not valid" }));
    }
  })
}

const updateUserById = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  if (!validateId(res, id)) return;
  const userExistanceResponse = checkUserExistance(id, users);
  let statusCode = Array.isArray(userExistanceResponse) ? 200 : 404;
  if (statusCode === 404) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userExistanceResponse));
    return;
  }
  let body = '';
  req.on('data', (chunk: Buffer) => body += chunk.toString());
  req.on('end', () => {
    const userObj: IUser = { id, ...JSON.parse(body) };
    const reqBodyValidationResponse = validateReqBody(userObj);
    statusCode = reqBodyValidationResponse.length === 0 ? 200 : 400;
    users = users.map((user) => {
      if (user.id === id) {
        return userObj;
      }
      return user;
    })
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(statusCode === 200 ? userObj : reqBodyValidationResponse));
  })
}

const deleteUserById = async (res: ServerResponse, id: string) => {
  if (!validateId(res, id)) return;
  const response = checkUserExistance(id, users);
  const statusCode = Array.isArray(response) ? 200 : 404;
  users = users.filter((user) => user.id !== id);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(statusCode === 200 ? users : response));
}

export { getUsers, getUserById, createUser, deleteUserById, updateUserById };