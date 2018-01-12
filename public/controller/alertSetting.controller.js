export default function AlertSettingController($scope, $routeParams, $location, $translate, docTitle, Notifier, mlaConst, MlJobService, AlertService, dashboardSelectModal, savedSearchSelectModal, savedDashboards, savedSearches) {
  docTitle.change('ML Alert');
  const notify = new Notifier({ location: 'ML Alert' });
  var vm = this;
  vm.compareOptions = [
    {compareType:'gte', operator:'≧'},
    {compareType:'gt', operator:'＞'},
    {compareType:'lte', operator:'≦'},
    {compareType:'lt', operator:'＜'}
  ];
  // default values
  vm.input = {
    mlJobId: '',
    alertId: '',
    description: '',
    subject: 'Elasticsearch ML Anomaly Detection',
    sendMail: true,
    mailAddressTo: [
      {value: ''}
    ],
    mailAddressCc: [],
    mailAddressBcc: [],
    notifySlack: false,
    slackAccount: '',
    slackTo: [
      {value: ''}
    ],
    notifyLine: false,
    lineNotifyAccessToken: '',
    linkDashboards: [],
    linkSavedSearches: [],
    threshold: 0,
    scheduleKind: 'cron',
    triggerSchedule: '0 * * * * ?',
    detectInterval: '1m',
    kibanaDisplayTerm: 900,
    locale: 'Asia/Tokyo',
    mlProcessTime: '10m',
    filterByActualValue: false,
    actualValueThreshold: 0,
    compareOption: vm.compareOptions[0],
    kibanaUrl: "http://localhost:5601/"
  };
  // other default values
  vm.internal = {
    showSetting: false,
    ShowDetailSetting: false
  };
  vm.dashboards = [];
  vm.savedSearches = [];
  vm.existsAlert = false;
  vm.autoSettingEnabled = true;
  vm.frequency = '150s';
  vm.queryDelay = '60s';
  var isFetch = false;
  var isChange = false;
  vm.changeJobId = function () {
    updateJobList(vm.input.mlJobId);
    if (isFetch) {
      isChange = true;
      return;
    }
    isChange = false;
    isFetch = true;
    MlJobService.search(vm.input.mlJobId, function (res) {
      let data = res.data;
      if (!data) {
        displayJobSearchResult(false);
        return;
      }
      if (!data.jobs) {
        displayJobSearchResult(false);
        return;
      }
      if (data.jobs.length === 0) {
        displayJobSearchResult(false);
        return;
      }
      displayJobSearchResult(true);
      vm.mlJob = data.jobs[0];
      autoSetting(vm.mlJob);
      finishSearch();
    }, function () {
      displayJobSearchResult(false);
      finishSearch();
    });
  };
  function displayJobSearchResult(isFetch) {
    if (isFetch) {
      vm.internal.showSetting = true;
    } else {
      vm.internal.showSetting = false;
    }
  }
  vm.showDetail = function () {
    vm.internal.ShowDetailSetting = true;
  };
  vm.hideDetail = function () {
    vm.internal.ShowDetailSetting = false;
  };
  vm.save = function () {
    AlertService.checkScripts(function(){
      AlertService.save(vm.input, function() {
        $location.path('/alert_list');
      }, function(error) {
        notify.error(error);
        console.error(error);
      });
    }, function(error){
      notify.error(error);
      console.error(error);
    });
  };
  vm.selectJob = function (jobId) {
    vm.input.mlJobId = jobId;
    vm.changeJobId();
  };
  vm.checkAlertId = function() {
    if (!vm.input.alertId || vm.input.alertId === "") {
      vm.existsAlert = false;
    } else {
      AlertService.search(vm.input.alertId, function(res) {
        vm.existsAlert = true;
      }, function(e) {
        vm.existsAlert = false;
      });
    }
  };
  vm.setThreshold = function(threshold) {
    vm.input.threshold = threshold;
  };
  vm.addTo = function() {
    vm.input.mailAddressTo.push({value: ''});
  };
  vm.deleteTo = function(index) {
    vm.input.mailAddressTo.splice(index, 1);
  };
  vm.addCc = function() {
    vm.input.mailAddressCc.push({value: ''});
  };
  vm.deleteCc = function(index) {
    vm.input.mailAddressCc.splice(index, 1);
  };
  vm.addBcc = function() {
    vm.input.mailAddressBcc.push({value: ''});
  };
  vm.deleteBcc = function(index) {
    vm.input.mailAddressBcc.splice(index, 1);
  };
  vm.addSlackTo = function() {
    vm.input.slackTo.push({value: ''});
  };
  vm.deleteSlackTo = function(index) {
    vm.input.slackTo.splice(index, 1);
  };
  vm.removeDashboard = function(index) {
    vm.dashboards.splice(index, 1);
    vm.input.linkDashboards = vm.dashboards.map(item => ({
      id : item.id,
      title : item.title
    }));
  };
  vm.removeSavedSearch = function(index) {
    vm.savedSearches.splice(index, 1);
    vm.input.linkSavedSearches = vm.savedSearches.map(item => ({
      id : item.id,
      title : item.title
    }));
  };
  vm.selectDashboard = function () {
    function select(dashboard) {
      if (!~vm.input.linkDashboards.map(item => item.id).indexOf(dashboard.id)) {
        vm.dashboards.push(dashboard);
        vm.input.linkDashboards = vm.dashboards.map(item => ({
          id : item.id,
          title : item.title
        }));
      }
    }
    $translate('MLA-SELECT_DASHBOARDS', ).then(function(translation) {
      const confirmModalOptions = {
        select: select,
        title: translation,
        showClose: true
      };
      dashboardSelectModal(
        confirmModalOptions
      );
    });
  };
  vm.selectSavedSearch = function () {
    function select(savedSearch) {
      if (!~vm.input.linkSavedSearches.map(item => item.id).indexOf(savedSearch.id)) {
        vm.savedSearches.push(savedSearch);
        vm.input.linkSavedSearches = vm.savedSearches.map(item => ({
          id : item.id,
          title : item.title
        }));
      }
    }
    $translate('MLA-SELECT_SAVED_SEARCH', ).then(function(translation) {
      const confirmModalOptions = {
        select: select,
        title: translation,
        showClose: true
      };
      savedSearchSelectModal(
        confirmModalOptions
      );
    });
  };
  vm.init = function () {
    setKibanaUrl();
    let alertId = $routeParams.alertId;
    if (alertId) {
      AlertService.search(alertId, function(res) {
        setInput(res["data"]);
      }, function(res) {
        vm.existsAlert = false;
        $translate('MLA-ALERT_NOT_EXIST', {"alertId": alertId}).then(function(translation) {
          notify.error(translation);
        });
      });
    }
    MlJobService.searchList(function (res) {
      $scope.mlJobs = res["data"]["jobs"];
      $scope.mlJobsCandidates = $scope.mlJobs;
      $scope.loaded = true;
    }, function (error) {
      console.error(error);
    });
  }

  function updateJobList(inputStr) {
    if (!inputStr || inputStr === "") {
      $scope.mlJobsCandidates = $scope.mlJobs;
    } else {
      $scope.mlJobsCandidates = $scope.mlJobs.filter(job => ~job.job_id.indexOf(vm.input.mlJobId));
    }
  }

  function setKibanaUrl() {
    let pattern = /^(.+)app\/es_ml_alert.*/;
    vm.input.kibanaUrl = $location.absUrl().replace(pattern, "$1");
  }

  function finishSearch() {
    isFetch = false;
    // Search again if job_id is changed
    if (isChange) {
      isChange = false;
      vm.changeJobId();
    }
  }

  function getDefault(value, defaultValue) {
    if (typeof value === "undefined") {
      return defaultValue;
    }
    return value;
  }

  function setInput(data) {
    vm.autoSettingEnabled = false;
    if (!$routeParams.clone) {
      vm.input.alertId = data._id;
      vm.existsAlert = true;
    }
    vm.input.mlJobId = data.watch.metadata.job_id;
    vm.input.description = data.watch.metadata.description;
    vm.input.threshold = getDefault(data.watch.metadata.threshold, vm.input.threshold);
    vm.input.detectInterval = getDefault(data.watch.metadata.detect_interval, vm.input.detectInterval);
    vm.input.kibanaDisplayTerm = getDefault(data.watch.metadata.kibana_display_term, vm.input.kibanaDisplayTerm);
    vm.input.locale = getDefault(data.watch.metadata.locale, vm.input.locale);
    vm.input.mlProcessTime = getDefault(data.watch.metadata.ml_process_time, vm.input.mlProcessTime);
    vm.input.linkDashboards = getDefault(data.watch.metadata.link_dashboards, vm.input.linkDashboards);
    vm.input.linkSavedSearches = getDefault(data.watch.metadata.link_saved_searches, vm.input.linkSavedSearches);
    vm.input.kibanaUrl = getDefault(data.watch.metadata.kibana_url, vm.input.kibanaUrl);
    vm.input.subject = getDefault(data.watch.metadata.subject, vm.input.subject);
    vm.input.filterByActualValue = getDefault(data.watch.metadata.filterByActualValue, vm.input.filterByActualValue);
    vm.input.actualValueThreshold = getDefault(data.watch.metadata.actualValueThreshold, vm.input.actualValueThreshold);
    vm.input.lineNotifyAccessToken = getDefault(data.watch.metadata.line_notify_access_token, vm.input.lineNotifyAccessToken);
    if (data.watch.actions.notify_line) {
      vm.input.notifyLine = true;
    }
    let compareOptionIndex = 0;
    if (vm.compareOptions) {
      compareOptionIndex = Math.max(0, vm.compareOptions.map(option => option.compareType).indexOf(data.watch.metadata.compareOption.compareType));
    }
    vm.input.compareOption = vm.compareOptions[compareOptionIndex];
    if (data.watch.trigger.schedule.hasOwnProperty('cron')) {
      vm.input.scheduleKind = 'cron';
      vm.input.triggerSchedule = data.watch.trigger.schedule.cron;
    } else if (data.watch.trigger.schedule.hasOwnProperty('interval')) {
      vm.input.scheduleKind = 'interval';
      vm.input.triggerSchedule = data.watch.trigger.schedule.interval;
    }
    if (data.watch.actions.send_email) {
      vm.input.sendMail = true;
      vm.input.mailAddressTo = data.watch.actions.send_email.email.to.map(address => ({value:address}));
      if (data.watch.actions.send_email.email.cc) {
        vm.input.mailAddressCc = data.watch.actions.send_email.email.cc.map(address => ({value:address}));
      }
      if (data.watch.actions.send_email.email.bcc) {
        vm.input.mailAddressBcc = data.watch.actions.send_email.email.bcc.map(address => ({value:address}));
      }
    } else {
      vm.input.sendMail = false;
    }
    if (data.watch.actions.notify_slack && data.watch.actions.notify_slack.slack.message.to) {
      vm.input.notifySlack = true;
      vm.input.slackAccount = getDefault(data.watch.actions.notify_slack.slack.account, vm.input.slackAccount);
      vm.input.slackTo = data.watch.actions.notify_slack.slack.message.to.map(slackTarget => ({value:slackTarget}));
    } else {
      vm.input.notifySlack = false;
    }
    savedDashboards.find("").then(function(savedData) {
      vm.dashboards = savedData.hits.filter(
        hit => ~data.watch.metadata.link_dashboards.map(dashboard => dashboard.id).indexOf(hit.id)
      );
      vm.input.linkDashboards = vm.dashboards.map(item => ({
        id : item.id,
        title : item.title
      }));
      vm.changeJobId();
    });
    savedSearches.find("").then(function(savedData) {
      vm.savedSearches = savedData.hits.filter(
        hit => ~data.watch.metadata.link_saved_searches.map(savedSearch => savedSearch.id).indexOf(hit.id)
      );
      vm.input.linkSavedSearches = vm.savedSearches.map(item => ({
        id : item.id,
        title : item.title
      }));
      vm.changeJobId();
    });
  }

  /**
   * Set initial values automatically according to the ML job information
   * @param job ML Job information
   * @return initial values
   */
  function autoSetting(job) {
    // Values are not overwritten when existing alert is edited.
    // But they should be changed if the target job is changed.
    if (!vm.autoSettingEnabled) {
      vm.autoSettingEnabled = true;
      return;
    }

    // kibanaDisplayTerm should be long if bucket_span is long.
    vm.input.kibanaDisplayTerm = AlertService.calculateKibanaDisplayTerm(job);

    // mlProcessTime is set according to the datafeed settings 
    MlJobService.getDataFeed(job.job_id, function (res) {
      let datafeeds = res.data.datafeeds;
      if (datafeeds && datafeeds.length != 0) {
        let datafeed = datafeeds[0];
        vm.input.mlProcessTime = AlertService.calculateMlProcessTime(job, datafeed);
      }
    }, function(error) {
      console.error(error);
    });
  };
}