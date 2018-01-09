var constValue = {
  names: {
    appName: 'ml_alert',
    mlIndexName: '.ml-anomalies-*',
    indexName: '.ml-alert',
    scriptForMail: 'create_partition_notify_for_mail',
    scriptForSlack: 'create_partition_notify_for_slack',
    scriptForLine: 'create_partition_notify_for_line'
  },
  displayNames: {
    'alert_list': '設定通知一覧',
    'alert_setting': '通知設定'
  },
  paths: {
    console: {
      method: 'POST',
      path: '/api/console/proxy'
    },
    mlJobList: {
      method: 'GET',
      path: '_xpack/ml/anomaly_detectors/'
    },
    mlJobDataFeed: {
      method: 'GET',
      path: '_xpack/ml/datafeeds/'
    },
    getWatch: {
      method: 'GET',
      path: '_xpack/watcher/watch/'
    },
    deleteWatch: {
      method: 'DELETE',
      path: '_xpack/watcher/watch/'
    },
    editWatch: {
      method: 'PUT',
      path: '_xpack/watcher/watch/'
    },
    getScript: {
      method: 'GET',
      path: '_scripts/'
    },
    putScript: {
      method: 'PUT',
      path: '_scripts/'
    }
  },
  alert: {
    threshold: 40,
    notification: 'mail',
    processTime: '3m'
  },
  mailAction: {
    "transform": {
      "script": {
        "id": "create_partition_notify_for_mail"
      }
    },
    "email": {
      "profile": "standard",
      "to": [
        "sample@sample.com"
      ],
      "subject": "{{ctx.metadata.subject}}",
      "body": {
        "html": "{{ctx.payload.message}}"
      }
    }
  },
  slackAction: {
    "transform": {
      "script": {
        "id": "create_partition_notify_for_slack"
      }
    },
    "slack" : {
      "message" : {
        "to" : [],
        "text": "Elasticsearch ML Anomaly Detection",
        "attachments" : [
          {
            "title": "{{ctx.payload.severity}}",
            "text": "{{ctx.payload.message}}",
            "color": "{{ctx.payload.severityColor}}"
          }
        ]
      }
    }
  },
  lineAction: {
    "transform": {
      "script": {
        "id": "create_partition_notify_for_line"
      },
    },
    "webhook": {
      "method": "POST",
      "host": "notify-api.line.me",
      "port": 443,
      "path": "/api/notify",
      "scheme": "https",
      "headers" : {
        "Authorization": "Bearer {{ctx.metadata.line_notify_access_token}}"
      },
      "params" : {
        "message" : "{{ctx.payload.message}}"
      }
    }
  },
  alertTemplate: {
    "trigger": {
      "schedule": {
        "interval": "1m"
      }
    },
    "input": {
      "search": {
        "request": {
          "search_type": "query_then_fetch",
          "indices": [
            ".ml-anomalies-*"
          ],
          "types": [],
          "body": {
            "sort": [
              {
                "timestamp": {
                  "order": "asc"
                }
              }
            ],
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "result_type": "record"
                    }
                  },
                  {
                    "match": {
                      "job_id": "{{ctx.metadata.job_id}}"
                    }
                  },
                  {
                    "range": {
                      "record_score": {
                        "gt": "{{ctx.metadata.threshold}}"
                      }
                    }
                  },
                  {
                    "range": {
                      "timestamp": {
                        "from": "now-{{ctx.metadata.detect_interval}}-{{ctx.metadata.ml_process_time}}",
                        "to": "now-{{ctx.metadata.ml_process_time}}"
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    },
    "condition": {
      "compare": {
        "ctx.payload.hits.total": {
          "gt": 0
        }
      }
    },
    "actions": {
      "send_email": {
        "transform": {
          "script": {
            "id": "create_partition_notify_for_mail"
          }
        },
        "email": {
          "profile": "standard",
          "to": [
            "sample@sample.com"
          ],
          "subject": "{{ctx.metadata.subject}}",
          "body": {
            "html": "{{ctx.payload.message}}"
          }
        }
      },
      "notify_slack": {
        "transform": {
          "script": {
            "id": "create_partition_notify_for_slack"
          },
        },
        "slack" : {
          "message" : {
            "to" : [],
            "text": "Elasticsearch ML Anomaly Detection",
            "attachments" : [
              {
                "title": "{{ctx.payload.severity}}",
                "text": "{{ctx.payload.message}}",
                "color": "{{ctx.payload.severityColor}}"
              }
            ]
          }
        }
      },
      "notify_line": {
        "transform": {
          "script": {
            "id": "create_partition_notify_for_line"
          },
        },
        "webhook": {
          "method": "POST",
          "host": "notify-api.line.me",
          "port": 443,
          "path": "/api/notify",
          "scheme": "https",
          "headers" : {
            "Authorization": "Bearer {{ctx.metadata.line_notify_access_token}}"
          },
          "params" : {
            "message" : "{{ctx.payload.message}}"
          }
        }
      }
    },
    "metadata": {
      "quate": "'",
      "link_dashboards": [],
      "kibana_display_term": 3600,
      "detect_interval": "1m",
      "description": "",
      "threshold": 0,
      "locale": "Asia/Tokyo",
      "kibana_url": "http://localhost:5601/",
      "alert_type": "mla",
      "ml_process_time": "3m",
      "subject": "Elasticsearch ML 異常検知通知",
      "line_notify_access_token": "",
      "double_quate": "\"",
      "job_id": "",
      "date_format": "yyyy/MM/dd HH:mm:ss"
    }
  }
};
export default constValue;