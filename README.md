X-Pack Machine Leaning用Alert通知簡単設定プラグイン
====

Kibana UI上で簡単に<br>
Elasticsearch Machine Leaningの異常検知時の通知を<br>
設定することができます。

<img src="https://user-images.githubusercontent.com/33506001/33833347-b733a83c-dec2-11e7-8d26-56268543db84.png" alt="Adding" style="width: 400px;"/>

# Requirement

|No  |項目名  |必須バージョン |
|---|---|---|
|1|kibana|6.0.0|

# 使い方

インストール実施した後に、Kibanaを起動してください。
Kibanaにアクセスすると、サイドメニューに「ML Alert」が追加されます。
こちらを選択して下さい。
本機能が起動します。

## Alert設定追加画面
通知対象としたいML jobを選択し、通知設定を開始します。
<img src="https://user-images.githubusercontent.com/33506001/33833347-b733a83c-dec2-11e7-8d26-56268543db84.png" alt="Adding" style="width: 300px;"/>

## Alert条件設定
通知先や通知条件を設定します。以下の設定ができます。
+ 通知先メールアドレス
+ 通知メッセージに含めるリンク先dashboard
+ 通知を行う異常検知スコア値

Alertの起動タイミングなど、<br/>
上記以外に必要なAlert設定値は、自動で生成します。

設定後に、Saveボタンを押下し、保存してください。

<img src="https://user-images.githubusercontent.com/33506001/33833428-f2003426-dec2-11e7-9f0d-69c46d21acbb.png" alt="condition" style="width: 300px;"/>

## Alert一覧画面
追加したAlert設定の一覧を表示します。
一覧の一括削除なども可能です。

<img src="https://user-images.githubusercontent.com/33506001/33833450-0772235a-dec3-11e7-95c9-7d1f043ceb89.png" alt="list" style="width: 300px;"/>

<img src="https://user-images.githubusercontent.com/33506001/33833505-392e98ce-dec3-11e7-94ff-efea47150614.png" alt="list" style="width: 300px;"/>

# インストール手順

## Kibanaへのプラグインインストール
Kibanaのインストールディレクトリに移動し、Kibanaが停止している状態で、以下のコマンドを実行してください。

```
sudo bin/kibana-plugin install file://<path to plugin>/es_ml_alert-x.x.x_y.y.y.zip
```

※Kibanaプロセス実行中にインストールコマンドを実行すると、インストールに1時間以上かかる場合があるので注意してください。

※Kibanaのバージョンに合ったインストール媒体を使ってください。

## Elasticsearchへの、メール設定追加
以下を参考に、elasticsearch.yml にメール通知用の設定を追加してください。

[E-mail設定参考リンク](https://www.elastic.co/guide/en/elasticsearch/reference/current/notification-settings.html#email-notification-settings)

### 設定例
```
xpack.notification.email.account:
    some_mail_account:
        email_defaults:
          from: notification@example.com
        smtp:
            auth: true
            starttls.enable: true
            starttls.required: true
            host: smtp.example.com
            port: 587
            user: notification@example.com
            password: passw0rd
```

## メール本文生成用スクリプトの登録
KibanaのDevToolsに、下記を貼り付けて実行し、メール本文生成用スクリプトを登録してください。

※次期バージョンで、スクリプト自動登録の機能を追加予定ですが、申し訳ありませんが本バージョンでは手動で登録してください。

```
PUT _scripts/create_partition_notify_for_mail
{
  "script": {
    "lang": "painless",
    "source": """
String makeFilter(def hit) {
  def rand = new Random();
  def vals = hit._source;
  def funcName = vals.function;
  def fieldName = vals.field_name;
  def fieldValue = vals.actual[0];
  def valFilterQuery = '';
  if (funcName == 'high_mean' || funcName == 'max') {
    def filterAlias = fieldName + '%20%E2%89%A5%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(gte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\'' + filterAlias + '\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  if (funcName == 'low_mean' || funcName == 'min') {
    def filterAlias = fieldName + '%20%E2%89%A4%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(lte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\'' + filterAlias + '\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  return valFilterQuery;
}
def rand = new Random();
def dateForJpn = LocalDateTime.ofInstant(Instant.ofEpochMilli(ctx.execution_time.millis), ZoneId.of(ctx.metadata.locale));
def dateForJpnStr = dateForJpn.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
def firstHit = ctx.payload.hits.hits[0];
def beforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000;
def afterDateMilli = firstHit._source.timestamp + ctx.metadata.kibana_display_term * 1000;
def beforeDate = Instant.ofEpochMilli(beforeDateMilli);
def afterDate = Instant.ofEpochMilli(afterDateMilli);
def url = ctx.metadata.kibana_url + 'app/ml#/explorer?_g=(ml:(jobIds:!(' + ctx.metadata.job_id + ')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def link = '<a href=' + ctx.metadata.double_quate + url + ctx.metadata.double_quate + '>KibanaアクセスURL(ML結果)</a>';
def message = 'Elasticsearch MLによって異常を検知しました.';
message += '<br />';
message += '<br />Alert ID: ' + ctx.watch_id;
message += '<br />' + ctx.metadata.description;
message += '<br />';
message += '<br />基本情報';
message += '<br />　' + link;
message += '<br />　検知時間: ' + dateForJpnStr;
message += '<br />　ML実行JobID: ' + ctx.metadata.job_id;
if (ctx.metadata.link_dashboards.length != 0) {
  message += '<br />　参照Dashboard: ';
  for (def dashboard : ctx.metadata.link_dashboards) {
    def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
    def dashboardLink = '<a href=' + ctx.metadata.double_quate + dashboardUrl + ctx.metadata.double_quate + '>' + dashboard.title + '</a>';
    message += dashboardLink + ' ';
  }
}
message += '<br /><br />詳細';
for (def hit : ctx.payload.hits.hits) {
  def anomalyDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(hit._source.timestamp), ZoneId.of(ctx.metadata.locale));
  def anomalyDateStr = anomalyDate.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
  message += '<br />　timestamp: ' + anomalyDateStr;
  def partitionName = hit._source.partition_field_name;
  def partitionValue = hit._source.partition_field_value;
  def partitionFilter = '';
  double score = hit._source.record_score;
  message += '<br />　function: ' + hit._source.function;
  message += '<br />　description: ' + hit._source.function_description;
  message += '<br />　field name: ' + hit._source.field_name;
  message += '<br />　anomaly score: ' + score;
  def typical = hit._source.typical[0];
  def actual = hit._source.actual[0];
  message += '<br />　actual: ' + actual;
  message += '<br />　typical: ' + typical;
  message += '<br />　probability: ' + hit._source.probability;
  if (partitionName != null) {
    partitionFilter = '(meta:(alias:!n,disabled:!f,index:i' + rand.nextLong() + ',key:' + partitionName + ',negate:!f,params:(query:' + partitionValue + ',type:phrase),type:phrase,value:' + partitionValue + '),query:(match:(' + partitionName + ':(query:' + partitionValue + ',type:phrase))))';
    message += '<br />　partitions:<br />　　partition name: ' + partitionName + '<br />　　partition value: ' + partitionValue;
    def partitionQuery = '&_a=(filters:!(' + partitionFilter + '))';
    message += '<br />　　partitioned dashboard: ';
    for (def dashboard : ctx.metadata.link_dashboards) {
      def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionQuery;
      def dashboardLink = '<a href=' + ctx.metadata.double_quate + dashboardUrl + ctx.metadata.double_quate + '>' + dashboard.title + '</a>';
      message += dashboardLink + ' ';
    }
  }
  if (ctx.metadata.link_saved_searches.length == 1) {
    def savedSearchId = ctx.metadata.link_saved_searches[0].id;
    def startAnomalyDate = Instant.ofEpochMilli(hit._source.timestamp);
    def endAnomalyDateMilli =hit._source.timestamp + hit._source.bucket_span * 1000;
    def endAnomalyDate = Instant.ofEpochMilli(endAnomalyDateMilli);
    def timeQuery = '_g=(time:(from:'+ ctx.metadata.quate + startAnomalyDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + endAnomalyDate + ctx.metadata.quate + '))';
    def targetDiscoveryUrl = '';
    def discoveryUrl = ctx.metadata.kibana_url + 'app/kibana#/discover/' + savedSearchId + '?';
    if (partitionName != null) {
      targetDiscoveryUrl = discoveryUrl + timeQuery + '&_a=(filters:!(' + partitionFilter + '))';
    } else {
      targetDiscoveryUrl = discoveryUrl + timeQuery;
    }
    message += '<br />　<a href=' + ctx.metadata.double_quate + targetDiscoveryUrl + ctx.metadata.double_quate + '>Saved Searchを開く</a>';
    def valQuery = makeFilter(hit);
    if (valQuery != '') {
      def queryFilterQuery = '';
      if (partitionName != null) {
        queryFilterQuery = '&_a=(filters:!(' + partitionFilter + ',' + valQuery + '))';
      } else {
        queryFilterQuery = '&_a=(filters:!(' + valQuery + '))';
      }
      def targetFilterDiscoveryUrl = discoveryUrl + timeQuery + queryFilterQuery;
      message += '<br />　<a href=' + ctx.metadata.double_quate + targetFilterDiscoveryUrl + ctx.metadata.double_quate + '>値で絞り込んでSaved Searchを開く</a>';
    }
  }
  message += '<br />';
}
return [ 'message' : message ];
"""
  }
}
```

# 開発に関して

Kibanaプラグインとして開発しています。<br>
以下にKibanaプラグインの開発情報を記載します。

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following npm tasks.

  - `npm start`

    Start kibana and have it include this plugin

  - `npm start -- --config kibana.yml`

    You can pass any argument that you would normally send to `bin/kibana` by putting them after `--` when running `npm start`

  - `npm run build`

    Build a distributable archive

  - `npm run test:browser`

    Run the browser tests in a real web browser

  - `npm run test:server`

    Run the server tests using mocha

For more information about any of these commands run `npm run ${task} -- --help`.

# Licence

[Apache Version 2.0](https://github.com/serive/es-ml-alert/blob/master/LICENSE)

# Author
@serive
