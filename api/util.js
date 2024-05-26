/**
 * 文字をつなげて返す
 */
export const strcat = (val1, val2) => {
  return val1 + val2;
};

/**
 * reqオブジェクトを参照するサンプル(GET,POSTで処理を切り分ける)
 */
export function use_request(arg1) {
  // 必要に応じてargumentsからreq,resを取得できる(アロー関数は不可)
  const context = arguments[arguments.length - 1];
  if (context.req['method'] == 'GET') {
    return { message: 'GET test1', arg1 };
  } else {
    return { message: 'POST test1', arg1 };
  }
}
