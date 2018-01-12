export default function AlertListController($scope, $routeParams, $location, $translate, docTitle, AlertService, confirmModal, Notifier, alertBulkEditModal) {
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
  $scope.activateAlert = function ($event) {
    var alertId = $event.currentTarget.value;
    AlertService.activate([alertId], function (successCount, totalCount) {
      $translate('MLA-ENABLED_ALERT', {"alertId": alertId}).then(function(translation) {
        notify.info(translation);
      });
    }, function (failCount, totalCount) {
      $translate('MLA-ENABLE_ALERT_FAILED', {"alertId": alertId}).then(function(translation) {
        notify.error(translation);
      });
    })
      .then($scope.init)
      .catch(error => notify.error(error));
  };
  $scope.deactivateAlert = function ($event) {
    var alertId = $event.currentTarget.value;
    AlertService.deactivate([alertId], function (successCount, totalCount) {
      $translate('MLA-DISABLED_ALERT', {"alertId": alertId}).then(function(translation) {
        notify.info(translation);
      });
    }, function (failCount, totalCount) {
      $translate('MLA-DISABLE_ALERT_FAILED', {"alertId": alertId}).then(function(translation) {
        notify.error(translation);
      });
    })
      .then($scope.init)
      .catch(error => notify.error(error));
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
        $translate('MLA-DELETED_ALERT', {"alertId": alertId}).then(function(translation) {
          notify.info(translation);
        });
      }, function () {
        $translate('MLA-DELETE_ALERT_FAILED', {"alertId": alertId}).then(function(translation) {
          notify.error(translation);
        });
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
    $translate('MLA-CONFIRM_DELETE_ALERT', {"alertId": alertId}).then(function(translation) {
      confirmModal(
        translation,
        confirmModalOptions
      );
    });
  };
  $scope.bulkEdit = function () {
    function doBulkDelete() {
      AlertService.delete($scope.selectedItems.map(item => item['_id']), function (successCount, totalCount) {
        $translate('MLA-DELETED_ALERTS', {"totalCount": totalCount, "successCount": successCount}).then(function(translation) {
          notify.info(translation);
        });
      }, function (failCount, totalCount) {
        $translate('MLA-DELETE_ALERTS_FAILED', {"totalCount": totalCount, "failCount": failCount}).then(function(translation) {
          notify.error(translation);
        });
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    function doBulkActivate() {
      AlertService.activate($scope.selectedItems.map(item => item['_id']), function (successCount, totalCount) {
        $translate('MLA-ENABLED_ALERTS', {"totalCount": totalCount, "successCount": successCount}).then(function(translation) {
          notify.info(translation);
        });
      }, function (failCount, totalCount) {
        $translate('MLA-ENABLE_ALERTS_FAILED', {"totalCount": totalCount, "failCount": failCount}).then(function(translation) {
          notify.error(translation);
        });
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    function doBulkDeactivate() {
      AlertService.deactivate($scope.selectedItems.map(item => item['_id']), function (successCount, totalCount) {
        $translate('MLA-DISABLED_ALERTS', {"totalCount": totalCount, "successCount": successCount}).then(function(translation) {
          notify.info(translation);
        });
      }, function (failCount, totalCount) {
        $translate('MLA-DISABLE_ALERTS_FAILED', {"totalCount": totalCount, "failCount": failCount}).then(function(translation) {
          notify.error(translation);
        });
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    function doBulkUpdate(input) {
      AlertService.bulkUpdate($scope.selectedItems.map(item => item['_id']), input, function (successCount, totalCount) {
        $translate('MLA-UPDATED_ALERTS', {"totalCount": totalCount, "successCount": successCount}).then(function(translation) {
          notify.info(translation);
        });
      }, function (failCount, totalCount) {
        $translate('MLA-UPDATE_ALERTS_FAILED', {"totalCount": totalCount, "failCount": failCount}).then(function(translation) {
          notify.error(translation);
        });
      })
        .then($scope.init)
        .then(function () {
          $scope.selectedItems.length = 0;
        })
        .catch(error => notify.error(error));
    }
    $translate(["MLA-DELETE_ALERTS_MESSAGE", "MLA-ENABLE_ALERTS_MESSAGE", "MLA-DISABLE_ALERTS_MESSAGE", "MLA-BULK_OPERATION_TITLE", "MLA-UPDATE_ALERTS_MESSAGE", "MLA-BULK_UPDATE"]).then(function(translations) {
      const confirmModalOptions = {
        onDelete: doBulkDelete,
        onActivate: doBulkActivate,
        onDeactivate: doBulkDeactivate,
        onBulkUpdate: doBulkUpdate,
        deleteMessage: translations["MLA-DELETE_ALERTS_MESSAGE"],
        activateMessage: translations["MLA-ENABLE_ALERTS_MESSAGE"],
        deactivateMessage: translations["MLA-DISABLE_ALERTS_MESSAGE"],
        title: translations["MLA-BULK_OPERATION_TITLE"],
        updateButtonText: translations["MLA-BULK_UPDATE"],
        updateMessage: translations["MLA-UPDATE_ALERTS_MESSAGE"],
        showClose: true
      };
      alertBulkEditModal(
        confirmModalOptions
      );
    });
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
  // Get watches of elastic-ml-alert
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