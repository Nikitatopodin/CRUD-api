import request from 'supertest';
import createServer from '..';
import { v4 as uuidv4 } from 'uuid';
import { errorMessages } from '../utils';
import { users } from '../requests';
import { statusCodes } from '../types';

const testServer = createServer(8000);
const user = {
  id: "62860f3a-6950-4d28-ac4d-d7467cde4629",
  username: 'Random',
  age: 22,
  hobbies: ['fishing']
}
const testUsers = [
  {
    id: "62860f3a-6950-4d28-ac4a-d7467cde4629",
    username: 'Helena',
    age: 21,
    hobbies: ['riding']
  },
  {
    id: "62860f3a-6950-4d28-ac4f-d7467cde4629",
    username: 'Nick',
    age: 25,
    hobbies: ['coding, swimming']
  },
  {
    id: "62860f3a-6950-4d28-ac4e-d7467cde4629",
    username: 'Paul',
    age: 28,
    hobbies: ['building, bowling']
  },
  {
    id: "62860f3a-6950-4d28-ac4c-d7467cde4629",
    username: 'Jack',
    age: 19,
    hobbies: ['plating computer games']
  },
  {
    id: "62860f3a-6950-4d28-ac43-d7467cde4629",
    username: 'Senna',
    age: 999,
    hobbies: ['killing']
  },
]


const testCases = [
  { method: 'get', endpoint: '/api/users', body: undefined, expected: { statusCode: statusCodes.OK } },
  { method: 'get', endpoint: '/api/user', body: undefined, expected: { statusCode: statusCodes.NOT_FOUND, body: { message: 'Invalid request' } } },
  { method: 'post', endpoint: '/api/users', body: user, expected: { statusCode: statusCodes.CREATED } },
  { method: 'delete', endpoint: '/api/users/invalid', body: undefined, expected: { statusCode: statusCodes.NOT_FOUND, body: { message: 'Invalid request' } } },
  { method: 'put', endpoint: `/api/users/${user.id}`, body: {...user, hobbies: ['swimming']}, expected: { statusCode: statusCodes.OK } },
  { method: 'put', endpoint: '/api/users/invalid', body: {...user, hobbies: ['dancing']}, expected: { statusCode: statusCodes.NOT_FOUND, body: { message: 'Invalid request' } } },
  { method: 'get', endpoint: '/api/users/Invalid', body: undefined, expected: { statusCode: statusCodes.BAD_REQUEST, body: { ...errorMessages.INVALID_USER_ID } } },
  { method: 'get', endpoint: `/api/users/${user.id}`, body: undefined, expected: { statusCode: statusCodes.OK } },
  { method: 'delete', endpoint: `/api/users/${user.id}`, body: undefined, expected: { statusCode: statusCodes.DELETED } },
  { method: 'get', endpoint: `/api/users/${user.id}`, body: undefined, expected: { statusCode: statusCodes.NOT_FOUND, body: { ...errorMessages.USER_NOT_EXIST } } },
]

const httpMethods = ['get', 'post', 'delete', 'put'];

function isHttpMethod(method: string): method is 'get' | 'post' | 'put' | 'delete' {
  return httpMethods.includes(method);
}

describe('test CRUD API with table tests', () => {
  afterAll(() => testServer.close());

  test.each(testCases)(
    `expect request %method on %endpoint witn %body to be %expected`,
    async ({ method, endpoint, body, expected }) => {
      if (!isHttpMethod(method)) {
        return
      }
      const res = await request(testServer)[method](endpoint).send(body)

      expect(res.statusCode).toBe(expected.statusCode);
      if (res.statusCode === statusCodes.NOT_FOUND) expect(res.body).toStrictEqual(expected.body);
    },
  );
});

describe('test CRUD api to match status code and response body', () => {
  afterAll(() => testServer.close());

  test('expect users array to be empty', async () => {
    const res = await request(testServer).get('/api/users');

    expect(res.statusCode).toBe(statusCodes.OK);
    expect(res.body).toMatchObject([]);
  })

  test('expect "User ID is invalid" on invalid id', async () => {
    const invalidId = 'a';
    const res = await request(testServer).get(`/api/users/${invalidId}`);

    expect(res.statusCode).toBe(statusCodes.BAD_REQUEST);
    expect(res.body).toStrictEqual(errorMessages.INVALID_USER_ID);
  })

  test('expect "User with provided ID doesn`t exist" on non-existing user', async () => {
    const nonExistentId = uuidv4();
    const res = await request(testServer).get(`/api/users/${nonExistentId}`);

    expect(res.statusCode).toBe(statusCodes.NOT_FOUND);
    expect(res.body).toStrictEqual(errorMessages.USER_NOT_EXIST);
  })

  test('expect users to contain user we send', async () => {
    const res = await request(testServer).post('/api/users').send(user);

    expect(res.statusCode).toBe(statusCodes.CREATED);
    expect(users).toContainEqual(user)
  })
  test('expect users not to be empty after post request', async () => {
    const res = await request(testServer).get('/api/users');

    expect(res.statusCode).toBe(statusCodes.OK);
    expect(res.body).not.toBe([]);
  })
  test('expect users to be empty after delete request', async () => {
    const res = await request(testServer).delete(`/api/users/${user.id}`);

    expect(res.statusCode).toBe(statusCodes.DELETED);
    expect(res.body).toBeFalsy();
    expect(users).toEqual([]);
  })

})

describe('test CRUD api to match snapshot', () => {
  afterAll(() => testServer.close());

  test('expect users to match snapshot after all requests', async () => {
    testUsers.forEach(async (testUser) => {
      await request(testServer).post('/api/users').send(testUser);
    })

    await request(testServer).delete(`/api/users${testUsers[1].id}`)
    await request(testServer).put(`/api/users${testUsers[2].id}`).send({ ...testUsers[2], hobbies: ['drinking', 'bowling'] })
    
    expect(users).toMatchSnapshot();
  })

})