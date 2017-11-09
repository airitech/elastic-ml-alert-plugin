export default function EsDevToolService() {
  return {
    /**
     * DevTools用のクエリストリング生成処理
     * @param method リクエストのメソッド
     * @param path ESに送付するパス
     * @return リクエストに付与すべきクエリストリング
     */
    createQuery: function (method, path) {
      let replacePath = path.replace(new RegExp('/', 'g'), '%2F');
      return 'path=' + replacePath + '&method=' + method;
    }
  };
}