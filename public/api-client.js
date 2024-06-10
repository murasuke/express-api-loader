/**
 * ブラウザからREST APIへの呼び出しをProxy経由で通常のメソッドのように見せかけたい
 * 【対応案】
 * 1:APIのソースをdynamic importsし、RESTの呼び出しに変換するProxyを生成する
 *   ⇒ ブラウザ側でサーバーソースが参照できるのはまずい・・・
 * 2:dynamic importしない。サーバ側から関数の型情報だけもらってProxyを生成。
 * 3:JSDocで型指定を行い、メソッドは「マジックメソッド」として実行時に解決する
 * 　⇒ 仮引数名がわからないのでダメだった
 * 4:ほかに何かあれば
 */

// 【対応案2:】⇒ 2, 3 の折衷案みたいになっちゃった・・・・
// 関数の型情報を取得して、Proxyを作る
// JSDocで型指定をしているので、メソッド定義の補完もできる

import { createProxy } from './api-proxy.js';
/** @type { import("../api/util.js") } */
const util = await createProxy('http://localhost:3000', 'util');
const result = await util.strcat('aa', 'bb');
console.log(result);
console.log(await util.use_request('test_value'));
