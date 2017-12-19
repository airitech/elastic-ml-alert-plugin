export default function AlertSettingController($scope, $routeParams, $location, docTitle, Notifier, mlaConst, MlJobService, AlertService, dashboardSelectModal, savedSearchSelectModal, savedDashboards, savedSearches) {
  docTitle.change('ML Alert');
  const notify = new Notifier({ location: 'ML Alert' });
  var vm = this;
  vm.compareOptions = [
    {compareType:'gte', operator:'≧'},
    {compareType:'gt', operator:'＞'},
    {compareType:'lte', operator:'≦'},
    {compareType:'lt', operator:'＜'}
  ];
  // 入力初期値
  vm.input = {
    mlJobId: '',
    alertId: '',
    description: '',
    subject: 'Elasticsearch ML 異常検知通知',
    mailAddressTo: [
      {value: ''}
    ],
    mailAddressCc: [],
    mailAddressBcc: [],
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
  // その他の初期値
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
    AlertService.save(vm.input, function() {
      $location.path('/alert_list');
    }, function(error) {
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
    const confirmModalOptions = {
      select: select,
      title: "ダッシュボード選択",
      showClose: true
    };
    dashboardSelectModal(
      confirmModalOptions
    );
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
    const confirmModalOptions = {
      select: select,
      title: "Saved Search 選択",
      showClose: true
    };
    savedSearchSelectModal(
      confirmModalOptions
    );
  };
  vm.init = function () {
    setKibanaUrl();
    let alertId = $routeParams.alertId;
    if (alertId) {
      AlertService.search(alertId, function(res) {
        setInput(res["data"]);
      }, function(res) {
        vm.existsAlert = false;
        notify.error(`${alertId}は存在しません`);
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
    // Do nothing.
    // 検索時に、jobidが変更されている場合は、再度検索する。
    if (isChange) {
      isChange = false;
      vm.changeJobId();
    }
  }

  function setInput(data) {
    vm.autoSettingEnabled = false;
    if (!$routeParams.clone) {
      vm.input.alertId = data._id;
      vm.existsAlert = true;
    }
    vm.input.mlJobId = data.watch.metadata.job_id;
    vm.input.description = data.watch.metadata.description;
    vm.input.threshold = data.watch.metadata.threshold;
    vm.input.detectInterval = data.watch.metadata.detect_interval;
    vm.input.kibanaDisplayTerm = data.watch.metadata.kibana_display_term;
    vm.input.locale = data.watch.metadata.locale;
    vm.input.mlProcessTime = data.watch.metadata.ml_process_time;
    vm.input.linkDashboards = data.watch.metadata.link_dashboards;
    vm.input.linkSavedSearches = data.watch.metadata.link_saved_searches;
    vm.input.kibanaUrl = data.watch.metadata.kibana_url;
    vm.input.subject = data.watch.metadata.subject;
    vm.input.filterByActualValue = data.watch.metadata.filterByActualValue;
    vm.input.actualValueThreshold = data.watch.metadata.actualValueThreshold;
    vm.input.compareOption = data.watch.metadata.compareOption;
    if (data.watch.trigger.schedule.hasOwnProperty('cron')) {
      vm.input.scheduleKind = 'cron';
      vm.input.triggerSchedule = data.watch.trigger.schedule.cron;
    } else if (data.watch.trigger.schedule.hasOwnProperty('interval')) {
      vm.input.scheduleKind = 'interval';
      vm.input.triggerSchedule = data.watch.trigger.schedule.interval;
    }
    vm.input.mailAddressTo = data.watch.actions.send_email.email.to.map(address => ({value:address}));
    if (data.watch.actions.send_email.email.cc) {
      vm.input.mailAddressCc = data.watch.actions.send_email.email.cc.map(address => ({value:address}));
    }
    if (data.watch.actions.send_email.email.bcc) {
      vm.input.mailAddressBcc = data.watch.actions.send_email.email.bcc.map(address => ({value:address}));
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
    savedSavedSearches.find("").then(function(savedData) {
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
   * job情報をもとに、Alertingの自動設定を行う。
   * @param job MLのJob情報
   * @return Alertの自動設定値
   */
  function autoSetting(job) {
    // 保存されているアラートの編集時は、
    // 保存されている設定をそのまま表示する。
    // ただし、その後jobを選択し直したら、変わるようにする。
    if (!vm.autoSettingEnabled) {
      vm.autoSettingEnabled = true;
      return;
    }

    // kibanaDisplayTermの初期値は、bucket_spanの15倍にする
    vm.input.kibanaDisplayTerm = AlertService.calculateKibanaDisplayTerm(job);

    // DataFeedの設定を取得して、mlProcessTimeを設定
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