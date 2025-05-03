import 'dotenv/config.js';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import { getUserById, getUsers, createUser, deleteUserById, updateUserById } from './requests';

const PORT = process.env.PORT || 4000;
const WORKERS_LENGTH = availableParallelism() - 1;
let currentWorkerId = 0;

const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url)
  switch (true) {
    case (req.url === '/api/users' && req.method === 'GET'):
      getUsers(res);
      break;
    case (req.url.match(/api\/users\/[0-9a-fA-F]+/) && req.method === 'GET'):
      const getUrlArr = req.url.split('/');
      getUserById(res, getUrlArr[getUrlArr.length - 1]);
      break;
    case (req.url === '/api/users' && req.method === 'POST'):
      createUser(req, res);
      break;
    case (req.url.match(/api\/users\/[0-9a-fA-F]+/) && req.method === 'PUT'):
      const putUrlArr = req.url.split('/');
      updateUserById(req, res, putUrlArr[putUrlArr.length - 1]);
      break;
    case (req.url.match(/api\/users\/[0-9a-fA-F]+/) && req.method === 'DELETE'):
      const deleteUrlArr = req.url.split('/');
      deleteUserById(res, deleteUrlArr[deleteUrlArr.length - 1]);
      break;
    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid request' }));
  }
}

const server = (port: number) => http.createServer(async (req, res) => {
  if (port === 4000 && process.env.BALANCER) {
    currentWorkerId = currentWorkerId  === WORKERS_LENGTH ? 1 :(currentWorkerId + 1)
    
    const requestOptions = {
      hostname: 'localhost',
      port: port + currentWorkerId,
      path: req.url,
      method: req.method,
      headers: req.headers
    } 
    
    const workerRequest = http.request(requestOptions, (workerResponse) => {
      workerResponse.pipe(res);
    })
    
    req.pipe(workerRequest)
    
  } else {
    requestHandler(req, res);
  }
})
  .listen(port || PORT)

if (!process.env.BALANCER) server(+PORT)

export default server;
export { currentWorkerId };
