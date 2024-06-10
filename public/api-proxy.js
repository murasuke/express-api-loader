/**
 * api-loaderで登録したREST APIを、クライアント側から通常の関数のように呼び出すためのproxy
 * 機能
 * ・apiとして登録したファイルのパスとurlを引き渡すと、REST API呼び出しに変換して結果を返す
 *   (非同期関数に変換される)
 * サンプルコード
 *   import { createProxy } from './api-proxy.js';
 *   const proxy = await createProxy('http://localhost:3000', 'util');
 *   // proxyが"localhost:3000/util/strcat/?val1=aa&val2=bb"の呼び出しに置き換える
 *   const result = await proxy.strcat('aa', 'bb');
 */
import path from 'path';
/**
 * dynamic importしたモジュールをproxyしてREST API呼び出しに変換する
 * @param {string} url_base
 * @param {string} api_path
 * @returns REST APIの結果を取得するためのPromiseを返す
 */
export const createProxy = async (url_base, api_path) => {
  const file_name = path.parse(api_path).name;
  // REST APIが公開している関数の型情報を取得する
  const definition_url = `${url_base}/api/definition/${file_name}`;
  const response = await fetch(definition_url);
  const func_def = await response.json();
  // 型情報をdump
  console.log(func_def);

  const proxy = new Proxy({}, {
    get(target, name, receiver) {
      if (!(name in func_def)) {
        // thenにアクセスがあるので無視(await?)
        return;
      }

      // 存在しないプロパティーにアクセスがあった場合temp_func(空の関数)を返す
      const temp_func = () => { };
      // Proxyでラップして返すことで、関数呼び出し時にapplyフックが実行される
      const func_proxy = new Proxy(temp_func, {
        apply(target, thisValue, args) {
          // 関数名と引数を表示する(nameはプロパティーアクセス時のキー名)
          console.log(`call missing function ${name}(${args})`);

          const params = func_def[name].reduce(
            (accumulator, value, index) => {
              return {...accumulator, [value]: args[index]};
            },
            {}
          );

          const query = new URLSearchParams(params).toString();
          const api_url = `${url_base}/${file_name}/${name}/?${query}`;
          // console.log(api_url);
          return fetch(api_url).then((response) => response.json());
        },
      });
      target[name] = func_proxy;
      return target[name];

    },
  });
  return proxy;
};
