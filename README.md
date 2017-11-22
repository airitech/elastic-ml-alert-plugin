Elasticsearch X-Pack Machine Learning用Alert通知簡単設定プラグイン
====

Kibana UI上で簡単に<br>
Elasticsearch Machine Learningの異常検知時の通知を<br>
設定することができます。

<img src="https://raw.github.com/wiki/serive/es-ml-alert/images/ui/02_add_alert-top.png" alt="Adding"/>

# Requirement

|No  |項目名  |必須バージョン |
|---|---|---|
|1|kibana|5.5.0～|

# 使い方

インストール実施した後に、Kibanaを起動してください。
Kibanaにアクセスすると、サイドメニューに「ML Alert」が追加されます。
こちらを選択して下さい。
本機能が起動します。

## Alert設定追加画面
通知対象としたいML jobを選択し、通知設定を開始します。

<img src="https://raw.github.com/wiki/serive/es-ml-alert/images/ui/02_add_alert-usage.png" alt="Adding"/>

## Alert条件設定
通知先や通知条件を設定します。以下の設定ができます。
+ 通知先メールアドレス
+ 通知メッセージに含めるリンク先dashboard
+ 通知を行う異常検知スコア値

Alertの起動タイミングなど、<br/>
上記以外に必要なAlert設定値は、自動で生成します。

設定後に、Saveボタンを押下し、保存してください。

<img src="https://raw.github.com/wiki/serive/es-ml-alert/images/ui/03_setting_condition-usage.png" alt="condition"/>

## Alert一覧画面
追加したAlert設定の一覧を表示します。
一覧の一括削除なども可能です。<br>
※注意：通知設定を個別に削除する機能が動作しません。<br>　削除は一括削除を利用してください。

<img src="https://raw.github.com/wiki/serive/es-ml-alert/images/ui/04_add_complete-usage.png" alt="list" style="width: 300px;"/>

# インストール手順

### Kibanaへのプラグインインストール
Kibanaのインストールディレクトリに移動し、以下のコマンドを実行してください。

```
./bin/kibana-plugin install file://<path to plugin>/es_ml_alert-x.x.x_y.y.y.zip
```

### Elasticsearchへの、メール設定追加
以下を参考に、メール通知用の設定を追加してください。

[E-mail設定参考リンク](https://www.elastic.co/guide/en/elasticsearch/reference/current/notification-settings.html#email-notification-settings)

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
@serive <br/>
Twitter: @serive8