export const script=`/**
 * maxやminなど追加でフィルタすると助かる場合には、追加のフィルタを入れる。
 */
String makeFilter(def hit) {
  def vals = hit._source;
  def funcName = vals.function;
  def fieldName = vals.field_name;
  def fieldValue = vals.actual[0];
  def valFilterQuery = '';
  // max/high_meanの場合
  // 指定値より大きいもので絞る
  if (funcName == 'high_mean' || funcName == 'max') {
    valFilterQuery = fieldName + ':[' + fieldValue + '%20TO%20*]';
  }
  // min/low_meanの場合
  if (funcName == 'low_mean' || funcName == 'min') {
    valFilterQuery = fieldName + ':[*%20TO%20' + fieldValue + ']';
  }
  return valFilterQuery;
}
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
def discoveryUrl = ctx.metadata.kibana_url + 'app/kibana#/discover?';
for (def hit : ctx.payload.hits.hits) {
  def anomalyDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(hit._source.timestamp), ZoneId.of(ctx.metadata.locale));
  def anomalyDateStr = anomalyDate.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
  message += '<br />　timestamp: ' + anomalyDateStr;
  def partitionName = hit._source.partition_field_name;
  def partitionValue = hit._source.partition_field_value;
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
    message += '<br />　partitions:<br />　　partition name: ' + partitionName + '<br />　　partition value: ' + partitionValue;
    def partitionQuery = '&_a=(query:(query_string:(analyze_wildcard:!t,query:' + ctx.metadata.quate + partitionName + ':' + partitionValue + ctx.metadata.quate + ')))';
    message += '<br />　　partitioned dashboard: ';
    for (def dashboard : ctx.metadata.link_dashboards) {
      def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionQuery;
      def dashboardLink = '<a href=' + ctx.metadata.double_quate + dashboardUrl + ctx.metadata.double_quate + '>' + dashboard.title + '</a>';
      message += dashboardLink + ' ';
    }
  }

  // Discover用のURL生成処理を実施。異常値の対象時間に絞り込みをかける。
  if (ctx.metadata.discovery_index != null) {
    def indexValue = ctx.metadata.discovery_index;
    def startAnomalyDate = Instant.ofEpochMilli(hit._source.timestamp);
    def endAnomalyDateMilli =hit._source.timestamp + hit._source.bucket_span * 1000;
    def endAnomalyDate = Instant.ofEpochMilli(endAnomalyDateMilli);
    def timeQuery = '_g=(time:(from:'+ ctx.metadata.quate + startAnomalyDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + endAnomalyDate + ctx.metadata.quate + '))';
    def indexQuery = 'index:' + ctx.metadata.quate + indexValue + ctx.metadata.quate + '';
    def queryStringQuery = '';
    def targetDiscoveryUrl = '';
    if (partitionName != null) {
      queryStringQuery = 'query:(query_string:(analyze_wildcard:!t,query:' +  ctx.metadata.quate + partitionName + ':' + partitionValue + ctx.metadata.quate + '))';
      targetDiscoveryUrl = discoveryUrl + timeQuery + '&_a=(' + indexQuery + ',' + queryStringQuery + ')';
    } else {
      targetDiscoveryUrl = discoveryUrl + timeQuery + '&_a=(' + indexQuery + ')';
    }
    message += '<br />　<a href=' + ctx.metadata.double_quate + targetDiscoveryUrl + ctx.metadata.double_quate + '>Discoverを開く</a>';
    // 値で絞り込みを実施して、Discoverを開けるようにする。
    def valQuery = makeFilter(hit);
    if (valQuery != "") {
      def queryFilterQuery = '';
      if (partitionName != null) {
        queryFilterQuery = 'query:(query_string:(analyze_wildcard:!t,query:' +  ctx.metadata.quate + partitionName + ':' + partitionValue + '%20AND%20' + valQuery + ctx.metadata.quate + '))';
      } else {
        queryFilterQuery = 'query:(query_string:(analyze_wildcard:!t,query:' +  ctx.metadata.quate + valQuery + ctx.metadata.quate + '))';
      }
      def targetFilterDiscoveryUrl = discoveryUrl + timeQuery + '&_a=(' + indexQuery + ',' + queryFilterQuery + ')';
      message += '<br />　<a href=' + ctx.metadata.double_quate + targetFilterDiscoveryUrl + ctx.metadata.double_quate + '>値で絞り込んでDiscoverを開く</a>';
    }
  }
}
return [ 'message' : message ];`;