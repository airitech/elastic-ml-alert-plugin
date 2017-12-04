import url from 'url';
import { script } from './script';

export default function (server, options) {
  server.log(['plugin:es_ml_alert', 'info'], 'es_ml_alert initialization');
  const { callWithInternalUser } = server.plugins.elasticsearch.getCluster('admin');
  let scriptAlreadyExists = false;
  // _scripts/<lang>/<id>のエンドポイントに対するリクエストはdeprecatedのため、6.0からは使えない
  // Kibana 6.0.0は、elasticsearch.jsのバージョンが13.0.1のため、getScriptやputScriptのAPIが使えない
  // この方法で登録するとスクリプト内の改行が"\n"になる
  callWithInternalUser('getScript', {
    id: "create_partition_notify_for_mail"
  }).then(function(response) {
    if (response.found) {
      server.log(['plugin:es_ml_alert', 'info'], 'mla script already exists');
    } else {
      server.log(['plugin:es_ml_alert', 'warning'], response);
      }
  }).catch(function(error) {
    // 存在しない場合は404エラーが返る
    if (!error.statusCode || error.statusCode != 404) {
      server.log(['plugin:es_ml_alert', 'error'], error);
      return;
    }
    callWithInternalUser('putScript', {
      id: "create_partition_notify_for_mail",
      body: {
        "source": script
      }
    }).catch(function(err) {
      server.log(['plugin:es_ml_alert', 'error'], err);
    }).then(function(response) {
      if (response.acknowledged) {
        server.log(['plugin:es_ml_alert', 'info'], 'mla script has been registered');
      } else {
        server.log(['plugin:es_ml_alert', 'warning'], response);
      }
    });
  });
};