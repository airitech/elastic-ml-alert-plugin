X-Pack Machine Leaning用Alert通知簡単設定プラグイン
====

ElasticsearchのMachineLeaningに対して、
異常検知時に通知する
Alert設定を簡易設定できるUIを提供する。

# Requirement

|No  |項目名  |必須バージョン |
|---|---|---|
|1|kibana|5.5.0～|

# Usage

インストール後、Kibanaを起動すると、
メニューに「ML Alert」というメニューが表示されます。

「ML Alert」を選択すると、
Machine Leaning jobを指定して、
簡単にAlerting設定ができる画面が表示されます。

# Install

Kibanaのインストールディレクトリに移動し、以下のコマンドを実行してください。

```
./bin/kibana-plugin install file://<path to plugin>/es_ml_alert-x.x.x_y.y.y.zip
```

# development

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