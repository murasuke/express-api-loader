/**
 * api-loaderで登録したREST APIを、クライアント側から通常の関数のように呼び出すためのproxy
 * 機能
 * ・apiとして登録したファイルのパスとurlを引き渡すと、REST API呼び出しに変換して結果を返す
 *   (非同期関数に変換される)
 * サンプルコード
 *   import { createProxy } from './api-proxy.js';
 *   const proxy = await createProxy('http://localhost:3000', './api/util.js');
 *   // proxyが"localhost:3000/util/strcat/?val1=aa&val2=bb"の呼び出しに置き換える
 *   const result = await proxy.strcat('aa', 'bb');
 */

import path from 'path';
import fnArgs from 'fn-args';

/**
 * dynamic importしたモジュールをproxyしてREST API呼び出しに変換する
 * @param {string} url_base
 * @param {string} api_path
 * @returns REST APIの結果を取得するためのPromiseを返す
 */
export const createProxy = async (url_base, api_path) => {
  const proxy = {};
  const module = await import(api_path);
  const file_name = path.parse(api_path).name;
  for (const key of Object.keys(module)) {
    const func = module[key];
    proxy[key] = new Proxy(func, {
      apply(target, thisValue, args) {
        console.log(`$call ${target.name}(${args})`);
        // 引数の配列をオブジェクトに変換
        const params = fnArgs(func).reduce((accumulator, value, index) => {
          return { ...accumulator, [value]: args[index] };
        }, {});
        const query = new URLSearchParams(params).toString();
        const api_url = `${url_base}/${file_name}/${target.name}/?${query}`;

        return fetch(api_url).then((response) => response.json());
      },
    });
  }

  return proxy;
};
