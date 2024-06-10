# JavaScriptのモジュールをREST APIとして公開するexpressミドルウェアと、クライアントから通常の関数のようにAPI呼び出しができるProxyサンプル

## 目標
### 目標1(サーバー側：expressミドルウェア)

* 特定のフォルダ(apiフォルダ)にjsファイルを配置するだけで、REST APIとして呼び出し可能にする

RailsやCakePHPのルーティングのように、URLから呼び出すファイル名と関数名を決定します

例：api/util.js に`function strcat(val1, val2){}`という関数を定義すると
 `/api/util?val1=foo&val2=bar`で呼び出しできるように自動で登録される

### 目標2(クライアント側：API呼び出しProxy)

* 通常の関数呼び出しのように、REST APIを呼び出し可能にする(非同期関数になります)

```js
import { createProxy } from './api-proxy.js';
const util = await createProxy('http://localhost:3000', 'util');
const result = await util.strcat('foo', 'bar');
console.log(result); // "foobar"
```


## 機能
### 機能1(サーバー側：expressミドルウェア)
* /api/にあるファイル(ES Module)を動的に読み込み、下記ルールでルーティングする
  * http(s)://<host_name>/<ファイル名(拡張子抜き)>/<関数名>
* (get:クエリストリング|post:リクエストbody)から関数の引数と同じ名前の値を取り出して、関数を呼び出す
* クライアント側からREST API呼び出しを可能にするため、型情報を公開する(関数名と、仮引数名の配列)

### 機能2(クライアント側：API呼び出しProxy)

### 利用イメージ

１.ミドルウェアに登録する
```js
// api用moduleのロード(非同期)
apiModuleLoader(app).then((handler) => app.use(handler));
```

２.RESTとして公開する関数(`util.js`)を`/api/`に保存する
```js:util.js
export function strcat(val1, val2) { return val1 + val2; }
```

３.expressを実行する
```
npm run express
```

４.ブラウザからURLを開く(/<ファイル名>/<関数名>?<クエリストリング>)

* http://localhost:3000/util/strcat?val1=str&val2=cat


![alt text](image.png)

APIが呼び出せたことを確認できました

５.POSTで呼び出し(curl)

POSTで呼び出し
```
$ curl -X POST -d "val1=str&val2=cat2" "http://localhost:3000/util/strcat"
"strcat2"
```

jsonで呼び出し
```
$ curl -X POST -H "Content-Type: application/json" -d '{"val1":"str", "val2": "cat3"}' "http://localhost:3000/util/strcat"
"strcat3"
```

### その他の機能

* 関数内で`reqest`オブジェクトを参照することができます(GET,POSTで処理を切り分ける等)

```js
/**
 * reqオブジェクトを参照するサンプル(GET,POSTで処理を切り分ける)
 */
export const test1 = () => {
  // 関数自体にreqが入っているため、必要があれば参照可能
  if (test1['Request']['method'] == 'GET') {
    return 'test1 get';
  } else {
    return { message: 'test1 post' };
  }
};

```

## ミドルウェア

* apiフォルダにあるファイルをdynamic importで読み込み、関数の一覧をexpressに登録する
* 登録するパスは`/<ファイル名(拡張子抜き)>/<関数名>`
* [fn-Args](https://www.npmjs.com/package/fn-args)で関数の引数名の一覧を取得し、クエリストリング(リクエストBody)からその名前で値を取り出して、関数を呼び出す
* 関数呼び出しの直前、関数オブジェクトに`req`をセットする（関数内でreqを利用できる）

```js:express-api-loader.js
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

const handler = (func, arg_mapper) => {
  return (req, res) => {
    func['Request'] = req; // requestを呼び出し元で参照できるようにする
    const result = func(...fnArgs(func).map(arg_mapper(req)));
    res.json(result);
  };
};

const apiModuleLoader = async (express) => {
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

export default apiModuleLoader;

```
