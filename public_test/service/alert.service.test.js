var parse = require('parse-duration');

import assert from 'assert';
import AlertService from '../../public/service/alert.service.js';
import EsDevToolService from '../../public/service/esConsole.service.js';
import constValue from '../../public/const.js';

describe('AlertService', () => {
  var AlertServiceInstance = AlertService(null, constValue, parse, EsDevToolService);
  describe('buildSchedule', () => {
    it('less than 1m', () => {
      var job = {
        analysis_config: {
          bucket_span: '30s'
        }
      };
      var  result = AlertServiceInstance.buildSchedule(job);
      assert.deepEqual(result, {
        triggerKind: 'interval',
        triggerSchedule: '30'
      });
    });
  });
});