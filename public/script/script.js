/** \ and ` must be escaped. \ -> \\, ` -> \`  */
export const script=`/**
 * maxやminなど追加でフィルタすると助かる場合には、追加のフィルタを入れる。
 */
String makeFilter(def hit) {
  def rand = new Random();
  def vals = hit._source;
  def funcName = vals.function;
  def fieldName = vals.field_name;
  def fieldValue = vals.actual[0];
  def valFilterQuery = '';
  // max/high_meanの場合
  // 指定値より大きいもので絞る
  if (funcName == 'high_mean' || funcName == 'max') {
    def filterAlias = fieldName + '%20%E2%89%A5%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(gte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\\'' + filterAlias + '\\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  // min/low_meanの場合
  if (funcName == 'low_mean' || funcName == 'min') {
    def filterAlias = fieldName + '%20%E2%89%A4%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(lte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\\'' + filterAlias + '\\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  return valFilterQuery;
}
def rand = new Random();
def dateForJpn = LocalDateTime.ofInstant(Instant.ofEpochMilli(ctx.execution_time.millis), ZoneId.of(ctx.metadata.locale));
def dateForJpnStr = dateForJpn.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
def firstHit = ctx.payload.hits.hits[0];
def beforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000;
def afterDateMilli = firstHit._source.timestamp + ctx.metadata.kibana_display_term * 1000 + firstHit._source.bucket_span * 1000;
def beforeDate = Instant.ofEpochMilli(beforeDateMilli);
def afterDate = Instant.ofEpochMilli(afterDateMilli);
def url = ctx.metadata.kibana_url + 'app/ml#/explorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def link = '<a href=' + ctx.metadata.double_quate + url + ctx.metadata.double_quate + '>Anomaly Explorer</a>';
def smvUrl = ctx.metadata.kibana_url + 'app/ml#/timeseriesexplorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def smvLink = '<a href=' + ctx.metadata.double_quate + smvUrl + ctx.metadata.double_quate + '>Single Metric Viewer</a>';
def message = 'Elasticsearch MLによって異常を検知しました.';
message += '<br />';
message += '<br />Alert ID: ' + ctx.watch_id;
message += '<br />' + ctx.metadata.description;
message += '<br />';
message += '<br />基本情報';
message += '<br />　' + link;
message += '<br />　' + smvLink;
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
  String partitionValue = hit._source.partition_field_value;
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
    String escapedPartitionValue = partitionValue.replace('!', '!!');
    escapedPartitionValue = escapedPartitionValue.replace('\\'', '!\\'');
    escapedPartitionValue = escapedPartitionValue.replace('%', '%25');
    escapedPartitionValue = escapedPartitionValue.replace('"', '%22');
    escapedPartitionValue = escapedPartitionValue.replace('#', '%23');
    escapedPartitionValue = escapedPartitionValue.replace('&', '%26');
    escapedPartitionValue = escapedPartitionValue.replace('+', '%2B');
    escapedPartitionValue = escapedPartitionValue.replace(' ', '%20');
    escapedPartitionValue = escapedPartitionValue.replace('\`', '%60');
    partitionFilter = '(meta:(alias:!n,disabled:!f,index:i' + rand.nextLong() + ',key:' + partitionName + ',negate:!f,params:(query:\\'' + escapedPartitionValue + '\\',type:phrase),type:phrase,value:\\'' + escapedPartitionValue + '\\'),query:(match:(' + partitionName + ':(query:\\'' + escapedPartitionValue + '\\',type:phrase))))';
    message += '<br />　partitions:<br />　　partition name: ' + partitionName + '<br />　　partition value: ' + partitionValue;
    def partitionQuery = '&_a=(filters:!(' + partitionFilter + '))';
    message += '<br />　　partitioned dashboard: ';
    for (def dashboard : ctx.metadata.link_dashboards) {
      def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionQuery;
      def dashboardLink = '<a href=' + ctx.metadata.double_quate + dashboardUrl + ctx.metadata.double_quate + '>' + dashboard.title + '</a>';
      message += dashboardLink + ' ';
    }
  }

  // Saved Search用のURL生成処理を実施。異常値の対象時間に絞り込みをかける。
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
    // 値で絞り込みを実施して、Saved Searchを開けるようにする。
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
return [ 'message' : message ];`;
export const scriptSlack=`/**
 * maxやminなど追加でフィルタすると助かる場合には、追加のフィルタを入れる。
 */
String makeFilter(def hit) {
  def rand = new Random();
  def vals = hit._source;
  def funcName = vals.function;
  def fieldName = vals.field_name;
  def fieldValue = vals.actual[0];
  def valFilterQuery = '';
  // max/high_meanの場合
  // 指定値より大きいもので絞る
  if (funcName == 'high_mean' || funcName == 'max') {
    def filterAlias = fieldName + '%20%E2%89%A5%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(gte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\\'' + filterAlias + '\\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  // min/low_meanの場合
  if (funcName == 'low_mean' || funcName == 'min') {
    def filterAlias = fieldName + '%20%E2%89%A4%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(lte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\\'' + filterAlias + '\\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  return valFilterQuery;
}
def rand = new Random();
def dateForJpn = LocalDateTime.ofInstant(Instant.ofEpochMilli(ctx.execution_time.millis), ZoneId.of(ctx.metadata.locale));
def dateForJpnStr = dateForJpn.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
def firstHit = ctx.payload.hits.hits[0];
def beforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000;
def afterDateMilli = firstHit._source.timestamp + ctx.metadata.kibana_display_term * 1000 + firstHit._source.bucket_span * 1000;
def beforeDate = Instant.ofEpochMilli(beforeDateMilli);
def afterDate = Instant.ofEpochMilli(afterDateMilli);
def url = ctx.metadata.kibana_url + 'app/ml#/explorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def link = '<' + url + '|Anomaly Explorer' + '>';
def smvUrl = ctx.metadata.kibana_url + 'app/ml#/timeseriesexplorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def smvLink = '<' + smvUrl + '|Single Metric Viewer' + '>';
def severity = 'Warning';
def severityColor = '#8BC8FB';
double maxScore = 0;
for (def hit : ctx.payload.hits.hits) {
  if (maxScore < hit._source.record_score) {
    maxScore = hit._source.record_score;
  }
}
if (maxScore >= 75) {
  severity = 'Critical';
  severityColor = '#FE5050';
} else if (maxScore >= 50) {
  severity = 'Major';
  severityColor = '#FBA740';
} else if (maxScore >= 25) {
  severity = 'Minor';
  severityColor = '#FDEC25';
}
def message = 'Alert ID: ' + ctx.watch_id;
//message += '
//' + ctx.metadata.description;
//message += '
message += '
' + link;
message += '
' + smvLink;
message += '

Alert Triggered Time: ' + dateForJpnStr;
message += '
ML JobID: ' + ctx.metadata.job_id;
if (ctx.metadata.link_dashboards.length != 0) {
  message += '
Dashboard:';
  for (def dashboard : ctx.metadata.link_dashboards) {
    def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
    def dashboardLink = '<' + dashboardUrl + '|' + dashboard.title + '>';
    message += '
  ' + dashboardLink;
  }
}
message += '

Detail';
for (def hit : ctx.payload.hits.hits) {
  def anomalyDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(hit._source.timestamp), ZoneId.of(ctx.metadata.locale));
  def anomalyDateStr = anomalyDate.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
  message += '
  timestamp: ' + anomalyDateStr;
  def partitionName = hit._source.partition_field_name;
  String partitionValue = hit._source.partition_field_value;
  def partitionFilter = '';
  double score = hit._source.record_score;
  message += '
  function: ' + hit._source.function;
  message += '
  description: ' + hit._source.function_description;
  message += '
  field name: ' + hit._source.field_name;
  message += '
  anomaly score: ' + score;
  def typical = hit._source.typical[0];
  def actual = hit._source.actual[0];
  message += '
  actual: ' + actual;
  message += '
  typical: ' + typical;
  message += '
  probability: ' + hit._source.probability;
  if (partitionName != null) {
    String escapedPartitionValue = partitionValue.replace('!', '!!');
    escapedPartitionValue = escapedPartitionValue.replace('\\'', '!\\'');
    escapedPartitionValue = escapedPartitionValue.replace('%', '%25');
    escapedPartitionValue = escapedPartitionValue.replace('"', '%22');
    escapedPartitionValue = escapedPartitionValue.replace('#', '%23');
    escapedPartitionValue = escapedPartitionValue.replace('&', '%26');
    escapedPartitionValue = escapedPartitionValue.replace('+', '%2B');
    escapedPartitionValue = escapedPartitionValue.replace(' ', '%20');
    escapedPartitionValue = escapedPartitionValue.replace('\`', '%60');
    escapedPartitionValue = escapedPartitionValue.replace('|', '%7C');
    escapedPartitionValue = escapedPartitionValue.replace('>', '%3E');
    escapedPartitionValue = escapedPartitionValue.replace('<', '%3C');
    partitionFilter = '(meta:(alias:!n,disabled:!f,index:i' + rand.nextLong() + ',key:' + partitionName + ',negate:!f,params:(query:\\'' + escapedPartitionValue + '\\',type:phrase),type:phrase,value:\\'' + escapedPartitionValue + '\\'),query:(match:(' + partitionName + ':(query:\\'' + escapedPartitionValue + '\\',type:phrase))))';
    message += '
  partitions:
    partition name: ' + partitionName + '
    partition value: ' + partitionValue;
    def partitionQuery = '&_a=(filters:!(' + partitionFilter + '))';
    message += '
    partitioned dashboard: ';
    for (def dashboard : ctx.metadata.link_dashboards) {
      def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionQuery;
      def dashboardLink = '<' + dashboardUrl + '|' + dashboard.title + '>';
      message += dashboardLink + ' ';
    }
  }

  // Saved Search用のURL生成処理を実施。異常値の対象時間に絞り込みをかける。
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
    message += '
  <' + targetDiscoveryUrl + '|Open Saved Search>';
    // 値で絞り込みを実施して、Saved Searchを開けるようにする。
    def valQuery = makeFilter(hit);
    if (valQuery != '') {
      def queryFilterQuery = '';
      if (partitionName != null) {
        queryFilterQuery = '&_a=(filters:!(' + partitionFilter + ',' + valQuery + '))';
      } else {
        queryFilterQuery = '&_a=(filters:!(' + valQuery + '))';
      }
      def targetFilterDiscoveryUrl = discoveryUrl + timeQuery + queryFilterQuery;
      message += '
  <' + targetFilterDiscoveryUrl + '|Open Saved Search filtered by value>';
    }
  }
  message += '
';
}
return [ 'message' : message , 'severity' : severity , 'severityColor' : severityColor ];`;