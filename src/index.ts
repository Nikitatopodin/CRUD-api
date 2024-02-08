import http from 'node:http';
import { getUserById, getUsers, createUser, deleteUserById, updateUserById } from './requests.ts';

const server = http.createServer((req, res) => {
  switch (true) {
    case (req.url === '/api/users' && req.method === 'GET'):
      getUsers(req, res);
      break;
    case (req.url.match(/api\/users\/[0-9]+/) && req.method === 'GET'):
      const getUrlArr = req.url.split('/');
      getUserById(req, res, getUrlArr[getUrlArr.length - 1]);
      break;
    case (req.url === '/api/users' && req.method === 'POST'):
      createUser(req, res);
      break;
    case (req.url.match(/api\/users\/[0-9]+/) && req.method === 'PUT'):
      const putUrlArr = req.url.split('/');
      updateUserById(req, res, putUrlArr[putUrlArr.length - 1]);
      break;
    case (req.url.match(/api\/users\/[0-9]+/) && req.method === 'DELETE'):
      const deleteUrlArr = req.url.split('/');
      deleteUserById(req, res, deleteUrlArr[deleteUrlArr.length - 1]);
      break;
    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end('There is no suck World');
  }

});

server.listen(8000);
