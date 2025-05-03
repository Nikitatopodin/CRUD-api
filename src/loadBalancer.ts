import cluster, { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';
import server, { currentWorkerId } from './index';

const DEFAULT_PORT = 4000;
const workerId = parseInt(process.env.id || '');

const CPUNum = availableParallelism();
const workers: Worker[] = [];

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running on port ${DEFAULT_PORT}`);

  for (let i = 1; i < CPUNum; i++) {
    workers.push(cluster.fork({ id: i }));
  }

  cluster.on('exit', (_, __, ___) => {
    console.log(`worker ${DEFAULT_PORT + workerId} died`);
  });

  if (process.env.BALANCER) {
    server(DEFAULT_PORT).on('request', (req) => {
      workers[currentWorkerId - 1].send(`Redirect ${req.method}${req.url} to Worker ${DEFAULT_PORT + currentWorkerId}`);
    })
  } else {
    server(DEFAULT_PORT);  
  }
} else {
  server(DEFAULT_PORT + workerId)
  
  process.on('message', (msg) => console.log(msg))
  console.log(`Worker ${DEFAULT_PORT + workerId} started`);
}

export { workers };