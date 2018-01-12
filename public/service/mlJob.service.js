export default function MlJobService($http, mlaConst, EsDevToolService) {
  const PATHS = mlaConst.paths;
  var CPATH = '..' + PATHS.console.path;
  var CMETHOD = PATHS.console.method;
  return {
    /**
     * Get the list of jobs
     * @param successCallback success callback
     * @param errorCallback callback for failure
     */
    searchList: function (successCallback, errorCallback) {
      let queryString = EsDevToolService.createQuery(PATHS.mlJobList.method, PATHS.mlJobList.path);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    },
    /**
     * Get job information by JobID
     * @param jobId Job ID
     * @param successCallback success callback
     * @param errorCallback callback for failure
     */
    search: function (jobId, successCallback, errorCallback) {
      let queryString = EsDevToolService.createQuery(PATHS.mlJobList.method, PATHS.mlJobList.path + jobId);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    },
    /**
     * Get data feed information by JobID
     * @param jobId Job ID
     * @param successCallback success callback
     * @param errorCallback callback for failure
     */
    getDataFeed: function (jobId, successCallback, errorCallback) {
      // Data Feed ID format is datafeed-<jobId>
      let datafeedId = `datafeed-${jobId}`;
      let queryString = EsDevToolService.createQuery(PATHS.mlJobDataFeed.method, PATHS.mlJobDataFeed.path + datafeedId);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    }
  };
}