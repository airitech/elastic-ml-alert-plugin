export default function EsDevToolService() {
  return {
    /**
     * Create query string for DevTools
     * @param method request method
     * @param path path of elasticsearch
     * @return query string
     */
    createQuery: function (method, path) {
      let replacePath = path.replace(new RegExp('/', 'g'), '%2F');
      return 'path=' + replacePath + '&method=' + method;
    }
  };
}