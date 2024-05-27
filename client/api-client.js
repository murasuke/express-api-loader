import { createProxy } from './api-proxy.js';
// dynamic importしたモジュールをProxy化
const proxy = await createProxy('http://localhost:3000', './util.js');
// proxyが"localhost:3000/util/strcat/?val1=aa&val2=bb"の呼び出しに置き換える
const result = await proxy.strcat('aa', 'bb');
console.log(result);

console.log(await proxy.use_request('test_value'));
