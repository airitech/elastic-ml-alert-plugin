export default function AlertService($http, mlaConst, parse, EsDevToolService, es) {
  const PATHS = mlaConst.paths;
  var CPATH = '..' + PATHS.console.path;
  var CMETHOD = PATHS.console.method;
  return {
    /**
     * MLA用のAlert情報一覧を取得する。
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    searchList: function (successCallback, errorCallback) {
      var result = es.search({
        index: ".watches",
        body: {
          query: {
            term: {
              "metadata.alert_type": "mla"
            }
          },
          "sort": [
            {
              "_id": {
                "order": "asc"
              }
            }
          ]
        }
      }).then(successCallback, errorCallback);
    },
    /**
     * AlertIDを指定してAlert情報を取得する。
     * @param alertId AlertのID
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    search: function (alertId, successCallback, errorCallback) {
      let queryString = EsDevToolService.createQuery(PATHS.getWatch.method, PATHS.getWatch.path + alertId);
      let uri = CPATH + '?' + queryString;
      $http.post(uri).then(successCallback, errorCallback);
    },
    /**
     * AlertIDのリストを指定してAlert情報を削除する。
     * @param alertIds AlertIDのリスト
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    delete: function (alertIds, successCallback, errorCallback) {
      var totalCount = alertIds.length;
      var successCount = 0;
      var failCount = 0;
      function deleteOneAlert(alertId) {
        const promise = new Promise((resolve, reject) => {
          let queryString = EsDevToolService.createQuery(PATHS.deleteWatch.method, PATHS.deleteWatch.path + alertId);
          let uri = CPATH + '?' + queryString;
          $http.post(uri).then(function () {
            successCount++;
            resolve();
          }, function (err) {
            console.error(err);
            failCount++;
            resolve();
          });
        });
        return promise;
      }
      var del = deleteOneAlert(alertIds[0]);
      for (let i = 1; i < totalCount; i++) {
        del = del.then(() => deleteOneAlert(alertIds[i]));
      }
      return del.then(function () {
        if (successCount > 0) {
          successCallback(successCount, totalCount);
        }
        if (failCount > 0) {
          errorCallback(failCount, totalCount);
        }
      });
    },
    /**
     * AlertIDのリストを指定してAlertをActivateする。
     * @param alertIds AlertIDのリスト
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    activate: function (alertIds, successCallback, errorCallback) {
      var totalCount = alertIds.length;
      var successCount = 0;
      var failCount = 0;
      function activateOneAlert(alertId) {
        const promise = new Promise((resolve, reject) => {
          let queryString = EsDevToolService.createQuery(PATHS.editWatch.method, PATHS.editWatch.path + alertId + "/_activate");
          let uri = CPATH + '?' + queryString;
          $http.post(uri).then(function () {
            successCount++;
            resolve();
          }, function (err) {
            console.error(err);
            failCount++;
            resolve();
          });
        });
        return promise;
      }
      var edit = activateOneAlert(alertIds[0]);
      for (let i = 1; i < totalCount; i++) {
        edit = edit.then(() => activateOneAlert(alertIds[i]));
      }
      return edit.then(function () {
        if (successCount > 0) {
          successCallback(successCount, totalCount);
        }
        if (failCount > 0) {
          errorCallback(failCount, totalCount);
        }
      });
    },
    /**
     * AlertIDのリストを指定してAlertをDeactivateする。
     * @param alertIds AlertIDのリスト
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    deactivate: function (alertIds, successCallback, errorCallback) {
      var totalCount = alertIds.length;
      var successCount = 0;
      var failCount = 0;
      function deactivateOneAlert(alertId) {
        const promise = new Promise((resolve, reject) => {
          let queryString = EsDevToolService.createQuery(PATHS.editWatch.method, PATHS.editWatch.path + alertId + "/_deactivate");
          let uri = CPATH + '?' + queryString;
          $http.post(uri).then(function () {
            successCount++;
            resolve();
          }, function (err) {
            console.error(err);
            failCount++;
            resolve();
          });
        });
        return promise;
      }
      var edit = deactivateOneAlert(alertIds[0]);
      for (let i = 1; i < totalCount; i++) {
        edit = edit.then(() => deactivateOneAlert(alertIds[i]));
      }
      return edit.then(function () {
        if (successCount > 0) {
          successCallback(successCount, totalCount);
        }
        if (failCount > 0) {
          errorCallback(failCount, totalCount);
        }
      });
    },
    /**
     * AlertIDのリストと変更するパラメータを指定してAlertを更新する。
     * @param alertIds AlertIDのリスト
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    bulkUpdate: function (alertIds, input, successCallback, errorCallback) {
      var totalCount = alertIds.length;
      var successCount = 0;
      var failCount = 0;
      function saveAlert(res) {
        let data = res["data"];
        let alertId = data._id;
        let body = data.watch;
        if (input.editMail) {
          body.actions.send_email.email.to = input.mailAddressTo.map(item => item.value);
          body.actions.send_email.email.cc = input.mailAddressCc.map(item => item.value);
          body.actions.send_email.email.bcc = input.mailAddressBcc.map(item => item.value);
        }
        if (input.editDashboard) {
          body.metadata.link_dashboards = input.linkDashboards;
        }
        let queryString = EsDevToolService.createQuery(PATHS.editWatch.method, PATHS.editWatch.path + alertId);
        let uri = CPATH + '?' + queryString;
        return $http.post(uri, body);
      }
      function updateOneAlert(alertId) {
        const promise = new Promise((resolve, reject) => {
          let queryString = EsDevToolService.createQuery(PATHS.getWatch.method, PATHS.getWatch.path + alertId);
          let uri = CPATH + '?' + queryString;
          $http.post(uri).then(function (res) {
            saveAlert(res).then(function() {
              successCount++;
              resolve();
            }, function (err) {
              console.error(err);
              failCount++;
              resolve();
            });
          }, function (err) {
            console.error(err);
            failCount++;
            resolve();
          });
        });
        return promise;
      }
      var edit = updateOneAlert(alertIds[0], input);
      for (let i = 1; i < totalCount; i++) {
        edit = edit.then(() => updateOneAlert(alertIds[i], input));
      }
      return edit.then(function () {
        if (successCount > 0) {
          successCallback(successCount, totalCount);
        }
        if (failCount > 0) {
          errorCallback(failCount, totalCount);
        }
      });
    },
    /**
     * Alertを作成して保存する
     * @param metadata 作成するアラートのmetadata
     * @param successCallback 成功時の処理
     * @param errorCallback 失敗時の処理
     */
    save: function (metadata, successCallback, errorCallback) {
      let queryString = EsDevToolService.createQuery(PATHS.editWatch.method, PATHS.editWatch.path + metadata.alertId);
      let uri = CPATH + '?' + queryString;
      let body = JSON.parse(JSON.stringify(mlaConst.alertTemplate));
      // templateの{{#toJson}}が使えなかったので直接入れる
      body.actions.send_email.email.to = metadata.mailAddressTo.map(item => item.value);
      if (metadata.mailAddressCc.length > 0) {
        body.actions.send_email.email.cc = metadata.mailAddressCc.map(item => item.value);
      }
      if (metadata.mailAddressBcc.length > 0) {
        body.actions.send_email.email.bcc = metadata.mailAddressBcc.map(item => item.value);
      }
      body.metadata.job_id = metadata.mlJobId;
      body.metadata.description = metadata.description;
      body.metadata.subject = metadata.subject;
      body.metadata.link_dashboards = metadata.linkDashboards;
      body.metadata.threshold = metadata.threshold;
      body.metadata.detect_interval = metadata.detectInterval;
      body.metadata.kibana_display_term = metadata.kibanaDisplayTerm;
      body.metadata.kibana_url = metadata.kibanaUrl;
      body.metadata.locale = metadata.locale;
      body.metadata.ml_process_time = metadata.mlProcessTime;
      body.metadata.filterByActualValue = metadata.filterByActualValue;
      body.metadata.actualValueThreshold = metadata.actualValueThreshold;
      body.metadata.compareOption = metadata.compareOption;
      if (metadata.scheduleKind === 'cron') {
        body.trigger.schedule = {
          cron: metadata.triggerSchedule
        };
      }
      if (metadata.filterByActualValue) {
        let rangeCondition = {
          "range": {
            "actual": {}
          }
        };
        rangeCondition.range.actual[metadata.compareOption.compareType] = "{{ctx.metadata.actualValueThreshold}}";
        body.input.search.request.body.query.bool.must.push(rangeCondition);
      }
      $http.post(uri, body).then(successCallback, errorCallback);
    },

    calculateMlProcessTime: function (job, datafeed) {
      let bucketSpan = job.analysis_config.bucket_span;
      let frequency = datafeed.frequency;
      let queryDelay = datafeed.query_delay;
      let totalDelaySeconds = Math.ceil((parse(bucketSpan) + parse(frequency) + parse(queryDelay) + parse('30s')) / 1000);
      return `${totalDelaySeconds}s`;
    },

    calculateKibanaDisplayTerm: function (job) {
      let bucketSpan = job.analysis_config.bucket_span;
      let kibanaDisplayTerm = 15 * parse(bucketSpan) / 1000;
      return kibanaDisplayTerm;
    }
  };
}