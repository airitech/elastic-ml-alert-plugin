README in other languages: [日本語](./README_ja.md)

Kibana app plugin for creating alert settings of Elasticsearch Machine Leaning Job easily
====

This plugin is for creating alert settings of X-Pack Machine Learning easily on Kibana UI.

<img src="https://user-images.githubusercontent.com/33506001/34860782-49f218a4-f7a3-11e7-8dda-aa1db7d1ef74.png" alt="settigs" />

# Requirement

|No  |item  |required version |
|---|---|---|
|1|Kibana|6.0.0, 6.0.1, 6.1.0, 6.1.1|

# How to use

You will see "ML Alert" menu in Kibana side bar.
Start to click this menu.

## Alert Settings
Select ML job first.
Then input alertID, description and other forms.

<img src="https://user-images.githubusercontent.com/33506001/34860782-49f218a4-f7a3-11e7-8dda-aa1db7d1ef74.png" alt="settigs" />

You can set the following information
+ Mail address
+ Slack channel
+ Dashboards to show link in the notification message
+ Saved Search to show link in the notification message
+ Threshold of anomaly score

Other settings are set automatically.
But you can change in advanced settings.

Press Save button to save the alert.

<img src="https://user-images.githubusercontent.com/33506001/34860784-4dd8794a-f7a3-11e7-851a-1c414095863a.png" alt="condition" />

<img src="https://user-images.githubusercontent.com/33506001/34860790-547a61c8-f7a3-11e7-9d9e-0f88928f3299.png" alt="condition detail" />

## Alert List
This view shows the list of alerts which are made through this plugin.<br>
Bulk operation is also supported.<br>

<img src="https://user-images.githubusercontent.com/33506001/34860804-5eb0af58-f7a3-11e7-8ac6-adc8c372f4a5.png" alt="list" />

<img src="https://user-images.githubusercontent.com/33506001/34860808-625ef07e-f7a3-11e7-9564-eb6574569f20.png" alt="bulk edit" />

# Installation and prerequisite settings

## Plugin installation to Kibana
Get plugin files from [Release page](https://github.com/serive/elastic-ml-alert-plugin/releases).

Go to Kibana installation directory, stop Kibana process and run the installation command.
```
sudo bin/kibana-plugin install file://<path to plugin>/es_ml_alert-x.x.x_y.y.y.zip
```

+ Stop Kibana process before plugin installation! It may take more than hours to install the plugin if the Kibana process is running.
+ Plugin version and Kibana version must be same.

## Mail account settings(If you notify by e-mail)
Add mail account settings to elasticsearch.yml.

[Configuring Email Accounts](https://www.elastic.co/guide/en/x-pack/current/actions-email.html#configuring-email)

### Example
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
### Example of mail notification
<img src="https://user-images.githubusercontent.com/33506001/34381422-c2e6d06a-eb4b-11e7-87d6-36df06f7f540.png" alt="mail" />


## Slack account settings(If you notify by Slack)
Add Slack account settings to elasticsearch.yml.

[Configuring Slack Accounts](https://www.elastic.co/guide/en/x-pack/current/actions-slack.html#configuring-slack)

### Example
```
xpack.notification.slack:
  account:
    ml_alert:
      url: https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXX
      message_defaults:
        from: elastic-ml-alert
```

### Example of Slack notification
<img src="https://user-images.githubusercontent.com/33506001/34381424-c49b2726-eb4b-11e7-8bb0-110d1c494851.png" alt="slack" />

+ Elasticsearch 6.1.1 X-Pack Watcher has a problem sending multibyte characters to slack(actually, it is the problem of webhook). Non-ASCII characters are replaced to "?". Therefore it may cause a problem if Machine Learning Job partition field or partition value has Non-ASCII characters.

## LINE Notify settings(If you notify by LINE)
Get access token from [LINE Notify](https://notify-bot.line.me/) .

You don't need to write it in elasticsearch.yml.

+ Link to Dashboard, Saved Search and Single Metric Viewer are not contained in the notification message of LINE Notify.

### Example of LINE Notify message
<img src="https://user-images.githubusercontent.com/33506001/34860737-ef302c1c-f7a2-11e7-8543-461c82667c79.png" alt="slack" />

# About development

This plugin is Kibana plugin.

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
