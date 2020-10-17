README in other languages: [English](./README.md)

Elasticsearch X-Pack Machine Learning用Alert通知簡単設定プラグイン
====

Kibana UI上で簡単に<br>
Elasticsearch Machine Learningの異常検知時の通知を<br>
設定することができます。

<img src="https://user-images.githubusercontent.com/33506001/34860507-56a44966-f7a1-11e7-89d0-3a836f3e2b75.png" alt="settigs" />

# Requirement

|No  |項目名  |必須バージョン |
|---|---|---|
|1|Kibana|6.0.0, 6.0.1, 6.1.0, 6.1.1, 6.1.2, 6.2.1, 6.2.2, 6.2.3, 6.2.4|

# 使い方

インストール実施した後に、Kibanaを起動してください。
Kibanaにアクセスすると、サイドメニューに「ML Alert」が追加されます。
こちらを選択して下さい。
本機能が起動します。

## Alert設定追加画面
異常検知結果を通知させたいML jobを選択し、設定を開始します。

<img src="https://user-images.githubusercontent.com/33506001/34860507-56a44966-f7a1-11e7-89d0-3a836f3e2b75.png" alt="settigs" />

## Alert条件設定
通知先や通知条件を設定します。以下の設定ができます。
+ 通知先メールアドレス
+ 通知先のSlack channel
+ LINE Notify通知用のアクセストークン
+ 通知メッセージに含めるリンク先のDashboard
+ 通知メッセージに含めるリンク先のSaved Search
+ 通知を行う異常検知スコア値

Alertの起動タイミングなど、上記以外の設定値は自動で生成しますが、詳細設定で変更することもできます。

設定後に、Saveボタンを押して保存してください。

<img src="https://user-images.githubusercontent.com/33506001/34860531-803970a8-f7a1-11e7-88ce-9ce9ec45880c.png" alt="condition" />

<img src="https://user-images.githubusercontent.com/33506001/34860677-8e8bb282-f7a2-11e7-9876-8c8a18b13818.png" alt="condition detail" />

## Alert一覧画面
追加したAlert設定の一覧を表示します。<br>
複数のAlertを選択して、一括で削除やDeactivateなどの操作をすることも可能です。<br>

<img src="https://user-images.githubusercontent.com/33506001/34860548-9b9fa95c-f7a1-11e7-9153-0d68616fba7d.png" alt="list" />

<img src="https://user-images.githubusercontent.com/33506001/34860556-a644a6fa-f7a1-11e7-9114-86b5cbb76185.png" alt="bulk edit" />

# インストール手順

## Kibanaへのプラグインインストール

[リリースページ](https://github.com/serive/elastic-ml-alert-plugin/releases) から、Kibanaのバージョンに合ったファイルを取得してください。

Kibanaのインストールディレクトリに移動し、Kibanaが停止している状態で、以下のコマンドを実行してインストールします。
```
sudo bin/kibana-plugin install file://<path to plugin>/es_ml_alert-x.x.x_y.y.y.zip
```

※Kibanaプロセス実行中にインストールコマンドを実行すると、インストールに1時間以上かかる場合があるので注意してください。

※Kibanaのバージョンに合ったインストール媒体を使ってください。バージョンが合わないと、インストールに失敗します。

## Elasticsearchへの、メール設定追加(メール通知を行う場合)
以下を参考に、elasticsearch.yml にメール通知用の設定を追加してください。

[Configuring Email Accounts](https://www.elastic.co/guide/en/x-pack/current/actions-email.html#configuring-email)

### 設定例
```
xpack.notification.email.account:
    some_mail_account:
        email_defaults:
          from: notification@example.com
        smtp:
            auth: true
            starttls.enable: true
            host: smtp.example.com
            port: 587
            user: notification@example.com
            password: passw0rd
```
### 通知メールの例
<img src="https://user-images.githubusercontent.com/33506001/34381422-c2e6d06a-eb4b-11e7-87d6-36df06f7f540.png" alt="mail" />


## Elasticsearchへの、Slack設定追加(Slack通知を行う場合)
以下を参考に、elasticsearch.yml にSlack通知用の設定を追加してください。

[Configuring Slack Accounts](https://www.elastic.co/guide/en/x-pack/current/actions-slack.html#configuring-slack)

### 設定例
```
xpack.notification.slack:
  account:
    ml_alert:
      url: https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXX
      message_defaults:
        from: elastic-ml-alert
```

### Slack通知の例
<img src="https://user-images.githubusercontent.com/33506001/34381424-c49b2726-eb4b-11e7-8bb0-110d1c494851.png" alt="slack" />

※ Elasticsearch 6.1.1 のX-Pack Watcherには、非ASCII文字をSlackに送ると（webhookも同様）全て「?」に変換されてしまう問題があります。そのため、Machine Learning Jobのpartition fieldやpartition valueにマルチバイト文字が含まれると、通知メッセージの表示がおかしくなったりリンクが壊れる場合があります。今後のバージョンアップで修正されるものと思われます。

## LINE Notifyの設定(LINEに通知する場合)
[LINE Notify](https://notify-bot.line.me/ja/) から、アクセストークンを取得してください。

取得したアクセストークンを指定すれば、通知が届くようになります。

※LINE Notifyによる通知メッセージには、Dashboard, Saved Search, Single Metric Viewerなどへのリンクは含まれません

### LINE Notifyによる通知メッセージの例
<img src="https://user-images.githubusercontent.com/33506001/34860737-ef302c1c-f7a2-11e7-8543-461c82667c79.png" alt="slack" />

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
