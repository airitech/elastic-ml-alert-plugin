export default function AlertListController($scope, $routeParams, $location, docTitle, AlertService, confirmModal, Notifier, alertBulkEditModal) {
  docTitle.change('ML Alert');
  const notify = new Notifier({ location: 'ML Alert' });
  $scope.selectedItems = [];
  $scope.data = [];
  $scope.filterText = "";
  $scope.areAllRowsChecked = function areAllRowsChecked() {
    if ($scope.data.length === 0) {
      return false;
    }
    return $scope.selectedItems.length === $scope.data.length;
  };
  $scope.filterAlertId = function($event) {
    $scope.mlJobAlerts = $scope.data
      .filter(datum => ~datum["_id"].indexOf($scope.filterText))
      .reduce(function (prev, alert) {
        var jobId = alert["_source"]["metadata"]["job_id"];
        if (jobId in prev) {
          prev[jobId].push(alert);
        } else {
          prev[jobId] = [alert];
        }
        return prev;
      }, {});
  };
  $scope.moveCreate = function () {
    $location.path('/alert_setting');
  };
  $scope.moveEdit = function ($event, clone) {
    if (clone) {
      $location.path('/alert_setting/' + $event.currentTarget.value).search({'clone': 'true'});;
    } else {
      $location.path('/alert_setting/' + $event.currentTarget.value);
    }
  };
  $scope.delete = function ($event) {
    var alertId = $event.currentTarget.value;
    function doDelete() {
      AlertService.delete([alertId], function () {
        notify.info(`${alertId}を削除しました`);
      }, function () {
        notify.error(`${alertId}の削除に失敗しました`);
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    const confirmModalOptions = {
      confirmButtonText: `Delete ${alertId}`,
      onConfirm: doDelete
    };
    confirmModal(
      `${alertId}を削除しますか？この操作は取り消せません。`,
      confirmModalOptions
    );
  };
  $scope.bulkEdit = function () {
    function doBulkDelete() {
      AlertService.delete($scope.selectedItems.map(item => item['_id']), function (successCount, totalCount) {
        notify.info(`${totalCount}個中${successCount}個を削除しました`);
      }, function (failCount, totalCount) {
        notify.error(`${totalCount}個中${failCount}個の削除に失敗しました`);
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    function doBulkActivate() {
      AlertService.activate($scope.selectedItems.map(item => item['_id']), function (successCount, totalCount) {
        notify.info(`${totalCount}個中${successCount}個を有効化しました`);
      }, function (failCount, totalCount) {
        notify.error(`${totalCount}個中${failCount}個の有効化に失敗しました`);
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    function doBulkDeactivate() {
      AlertService.deactivate($scope.selectedItems.map(item => item['_id']), function (successCount, totalCount) {
        notify.info(`${totalCount}個中${successCount}個を無効化しました`);
      }, function (failCount, totalCount) {
        notify.error(`${totalCount}個中${failCount}個の無効化に失敗しました`);
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    function doBulkUpdate(input) {
      AlertService.bulkUpdate($scope.selectedItems.map(item => item['_id']), input, function (successCount, totalCount) {
        notify.info(`${totalCount}個中${successCount}個を更新しました`);
      }, function (failCount, totalCount) {
        notify.error(`${totalCount}個中${failCount}個の更新に失敗しました`);
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    const confirmModalOptions = {
      onDelete: doBulkDelete,
      onActivate: doBulkActivate,
      onDeactivate: doBulkDeactivate,
      onBulkUpdate: doBulkUpdate,
      deleteMessage: "選択したアラートを削除します。この操作は取り消せません。",
      activateMessage: "選択したアラートを有効化します。",
      deactivateMessage: "選択したアラートを無効化します。",
      title: "アラートの一括操作",
      showClose: true
    };
    alertBulkEditModal(
      confirmModalOptions
    );
  };
  $scope.toggleAll = function () {
    if ($scope.selectedItems.length === $scope.data.length) {
      $scope.selectedItems.length = 0;
    } else {
      $scope.selectedItems = [].concat($scope.data);
    }
  };
  $scope.toggleItem = function (item) {
    const i = $scope.selectedItems.indexOf(item);
    if (i >= 0) {
      $scope.selectedItems.splice(i, 1);
    } else {
      $scope.selectedItems.push(item);
    }
  };
  // 該当のWatcherの設定一覧を取得する。
  $scope.init = function () {
    AlertService.searchList(function (body) {
      $scope.data = body["hits"]["hits"];
      $scope.mlJobAlerts = body["hits"]["hits"]
        .filter(datum => ~datum["_id"].indexOf($scope.filterText))
        .reduce(function (prev, alert) {
          var jobId = alert["_source"]["metadata"]["job_id"];
          if (jobId in prev) {
            prev[jobId].push(alert);
          } else {
            prev[jobId] = [alert];
          }
          return prev;
        }, {});
      if (Object.keys($scope.mlJobAlerts).length == 0) {
        $scope.moveCreate();
      }
    }, function (error) {
      console.error(error.message);
    });
  }
}