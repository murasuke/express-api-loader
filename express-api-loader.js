/**
 * JavaScriptのモジュールをREST APIとして公開するexpressミドルウェア
 * 機能
 * ・/api/にあるファイル(module)を動的に読み込み、下記ルールでURLとマッピングする
 * 　http(s)://<host_name>/<ファイル名(拡張子抜き)>/<関数名>
 * ・(get:クエリストリング|post:リクエストbody)から関数の引数と同じ名前で取り出して、関数を呼び出す
 * ex.
 *  api/api.ts に `export const strcat = (val1, val2) => val1 + val2;` という関数が宣言すると
 *  localhost/api/strcat?val1=1&val2=2 で呼び出すことができる
 */

import fs from 'fs';
import path from 'path';
import fnArgs from 'fn-args';

const handler = (func, mapper) => {
  return (req, res) => {
    // 引数の最後に{ req, res }を追加（必要に応じてargumentsから取り出す)
    const result = func(...[...fnArgs(func).map(mapper(req)), { req, res }]);
    res.json(result);
  };
};

const apiLoader = async (express) => {
  const api_files = fs.readdirSync('./api');
  for (let file_name of api_files) {
    const module = await import(`./api/${file_name}`);
    file_name = path.parse(file_name).name;
    for (const key of Object.keys(module)) {
      const func = module[key];
      const route = `/${file_name}/${key}`;
      if (typeof func === 'function') {
        express.get(
          route,
          handler(func, (req) => (arg) => req.query[arg])
        );
        express.post(
          route,
          handler(func, (req) => (arg) => req.body[arg])
        );
      }
    }
  }
  const requestHandler = async (req, res, next) => {
    next();
  };
  return requestHandler;
};

export default apiLoader;
