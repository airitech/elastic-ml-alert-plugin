import { resolve } from 'path';
import serverInit from './server/serverInit';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    uiExports: {

      app: {
        title: 'Ml Alert',
        description: 'Create Alert Setting for ML',
        main: 'plugins/es_ml_alert/app'
      },
      translations: [
        resolve(__dirname, './translations/en.json'),
        resolve(__dirname, './translations/ja.json')
      ]
    },
    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },
    init(server, options) {
      // Add server routes and initalize the plugin here
      serverInit(server, options);
    }
  });
};
