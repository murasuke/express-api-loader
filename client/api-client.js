import { createProxy } from './api-proxy.js';
const proxy = await createProxy('http://localhost:3000', './util.js');
const result = await proxy.strcat('aa', 'bb');
console.log(result);

console.log(await proxy.use_request('test_value'));
