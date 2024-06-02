/**
 * ブラウザからREST APIへの呼び出しをProxy経由で通常のメソッドのように見せかけたい
 * 【対応案】
 * 1:APIのソースをdynamic importsし、RESTの呼び出しに変換するProxyを生成する
 *   ⇒ ブラウザ側でサーバーソースが参照できるのはまずい・・・
 * 2:util.jsをブラウザ側でdynamic importするのをやめる。サーバ側から関数の型情報だけもらってProxyを生成できないか？
 * 3:JSDocで型指定を行い、メソッドは「マジックメソッド」として実行時に解決する
 * 4:ほかに何かあれば
 */

// 【対応案1:】
// Proxyを作る際、APIのソース(util.js)を参照できない(publicからサーバ側コードが直接参照できるのはまずい)
// import { createProxy } from './api-proxy-1.js';
// const proxy = await createProxy('http://localhost:3000', './util.js');
// const result = await proxy.strcat('aa', 'bb');
// console.log(result);
// console.log(await proxy.use_request('test_value'));

// 【対応案2:】
// 関数の型情報を取得して、Proxy作る

import { createProxy } from './api-proxy-2.js';
const proxy = await createProxy('http://localhost:3000', './util.js');
const result = await proxy.strcat('aa', 'bb');
console.log(result);
console.log(await proxy.use_request('test_value'));
