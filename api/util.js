/**
 * 文字をつなげて返す
 */
export function strcat(val1, val2) {
  return val1 + val2;
}

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
