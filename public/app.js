var parse = require('parse-duration');

import moment from 'moment';
import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/es';
import 'ui/modals';
import 'ui/courier';
import 'ui/tooltip';
import 'ui/doc_title';
import 'ui/autoload/styles';
import 'ui/react_components';
import './less/main.less';
import 'plugins/kibana/dashboard/saved_dashboard/saved_dashboards';
import 'plugins/kibana/discover/saved_searches/saved_searches';
import alertListTemplate from './templates/alertList.html';
import alertSettingTemplate from './templates/alertSetting.html';
import headerTemplate from './templates/common/header.html';

import { alertBulkEditModal } from './modules/modals/alertBulkEditModal';
import { dashboardSelectModal } from './modules/modals/dashboardSelectModal';
import { savedSearchSelectModal } from './modules/modals/savedSearchSelectModal';

import HeaderController from './controller/common/header.controller';
import AlertListController from './controller/alertList.controller';
import AlertSettingController from './controller/alertSetting.controller';

import EsDevToolService from './service/esConsole.service';
import MlJobService from './service/mlJob.service';
import AlertService from './service/alert.service';

import constValue from './const';
import { script } from './script/script';

uiRoutes.enable();
uiRoutes
  .when('/alert_setting/:alertId', {
    template: alertSettingTemplate,
    controller: 'AlertSettingController',
    controllerAs: 'asCtrl'
  })
  .when('/alert_setting', {
    template: alertSettingTemplate,
    controller: 'AlertSettingController',
    controllerAs: 'asCtrl'
  })
  .when('/alert_list', {
    template: alertListTemplate,
    controller: 'AlertListController',
    controllerAs: 'alCtrl'
  })
  .when('/', {
    redirectTo: '/alert_list'
  });

uiModules
  .get('app/ml_alert', [])
  .constant('mlaConst', constValue)
  .constant('script', script)
  .constant('parse', parse)
  .controller('AlertListController', AlertListController)
  .controller('AlertSettingController', AlertSettingController)
  .directive('mlHeader', function () {
    return {
      restrict: 'E',
      template: headerTemplate,
      controller: HeaderController,
      controllerAs: 'hCtrl'
    };
  })
  .factory('EsDevToolService', EsDevToolService)
  .factory('MlJobService', MlJobService)
  .factory('AlertService', AlertService);
