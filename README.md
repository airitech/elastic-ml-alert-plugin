Build alerting config for X-Pack Machine Leaning.
====

ElasticsearchのMachineLeaning Jobに対して、
Alert通知設定を簡易設定できるUIを提供する。

# Requirement

|No  |項目名  |必須バージョン |
|---|---|---|
|1|kibana|v5.5.0～|

# Usage


# Install

# Licence

[Apache Version 2.0](https://github.com/serive/es-ml-alert/blob/master/LICENSE)

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

# Author
@serive