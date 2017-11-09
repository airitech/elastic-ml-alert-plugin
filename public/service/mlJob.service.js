export default function MlJobService($http, mlaConst, EsDevToolService) {
  const PATHS = mlaConst.paths;
  var CPATH = '..' + PATHS.console.path;
  var CMETHOD = PATHS.console.method;
  return {
    /**
     * Job情報一覧を取得する。
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    searchList: function (successCallback, errorCallback) {
      let queryString = EsDevToolService.createQuery(PATHS.mlJobList.method, PATHS.mlJobList.path);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    },
    /**
     * JobIDを指定してJob情報を取得する。
     * @param jobId JobのID
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    search: function (jobId, successCallback, errorCallback) {
      let queryString = EsDevToolService.createQuery(PATHS.mlJobList.method, PATHS.mlJobList.path + jobId);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    },
    /**
     * JobIDを指定してData Feedを取得する。
     * @param jobId JobのID
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    getDataFeed: function (jobId, successCallback, errorCallback) {
      // Data Feed IDは、 datafeed-<jobId> となる。Data FeedとJobが1対1に対応しないことはある？
      let datafeedId = `datafeed-${jobId}`;
      let queryString = EsDevToolService.createQuery(PATHS.mlJobDataFeed.method, PATHS.mlJobDataFeed.path + datafeedId);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    }
  };
}