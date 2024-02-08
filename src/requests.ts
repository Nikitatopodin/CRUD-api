import { v4 as uuidv4 } from 'uuid';

let users = [
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

const getUsers = async (req: any, res: any) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
}

const getUserById = async (req: any, res: any, id: string) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users.filter((user) => user.id === id)));
}

const createUser = async (req: any, res: any) => {
    let body = '';
    req.on('data', (chunk: Buffer) => body += chunk.toString());
    req.on('end', () => {
        const userObj = JSON.parse(body);
        const user = { id: uuidv4(), ...userObj }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        users.push(user);
    })
}

const updateUserById = async (req: any, res: any, id: string) => {
    let body = '';
    req.on('data', (chunk: Buffer) => body += chunk.toString());
    req.on('end', () => {
        const userObj = { id, ...JSON.parse(body) };
        users = users.map((user) => {
            if (user.id === id) {
                return userObj;
            }
            return user;
        })
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userObj));
    })
}

const deleteUserById = async (req: any, res: any, id: string) => {
    users = users.filter((user) => user.id !== id);
    res.writeHead(204, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
}

export { getUsers, getUserById, createUser, deleteUserById, updateUserById };