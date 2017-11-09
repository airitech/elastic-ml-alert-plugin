import assert from 'assert';
import EsDevToolService from '../../public/service/esConsole.service.js';

describe('EsDevToolService', () => {
  var EsDevToolServiceInstance = EsDevToolService();
  describe('createQuery', () => {
    it('GET test', () => {
      let result = EsDevToolServiceInstance.createQuery('GET', 'path/to/test');
      assert.equal(result, 'path=path%2Fto%2Ftest&method=GET');
    });
  });
});