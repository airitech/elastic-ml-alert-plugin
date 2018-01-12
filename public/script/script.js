/** \ and ` must be escaped. \ -> \\, ` -> \`  */
export const script=`/**
 * Filter for max, high_mean, min and low_mean
 */
String makeFilter(def hit) {
  def rand = new Random();
  def vals = hit._source;
  def funcName = vals.function;
  def fieldName = vals.field_name;
  def fieldValue = vals.actual[0];
  def valFilterQuery = '';
  // max/high_mean
  // filter values greater than or equal to the actual value
  if (funcName == 'high_mean' || funcName == 'max') {
    def filterAlias = fieldName + '%20%E2%89%A5%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(gte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\\'' + filterAlias + '\\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  // min/low_mean
  // filter values lower than or equal to the actual value
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
def longBeforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000 - firstHit._source.bucket_span * 1000 * 100 - 1000 * 60 * 60 * 24;
def beforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000;
def afterDateMilli = firstHit._source.timestamp + ctx.metadata.kibana_display_term * 1000 + firstHit._source.bucket_span * 1000;
def longBeforeDate = Instant.ofEpochMilli(longBeforeDateMilli);
def beforeDate = Instant.ofEpochMilli(beforeDateMilli);
def afterDate = Instant.ofEpochMilli(afterDateMilli);
def url = ctx.metadata.kibana_url + 'app/ml#/explorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def link = '<a href=' + ctx.metadata.double_quate + url + ctx.metadata.double_quate + '>Anomaly Explorer</a>';
def smvUrl = ctx.metadata.kibana_url + 'app/ml#/timeseriesexplorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + longBeforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def smvLink = '<a href=' + ctx.metadata.double_quate + smvUrl + ctx.metadata.double_quate + '>Single Metric Viewer</a>';
def message = ctx.metadata.subject;
message += '<br />';
message += '<br />Alert ID: ' + ctx.watch_id;
message += '<br />' + ctx.metadata.description;
message += '<br />';
message += '<br />' + link;
message += '<br />' + smvLink;
message += '<br />Alert Triggered Time: ' + dateForJpnStr;
message += '<br />ML JobID: ' + ctx.metadata.job_id;
if (ctx.metadata.link_dashboards.length != 0) {
  message += '<br />Dashboard: ';
  for (def dashboard : ctx.metadata.link_dashboards) {
    def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
    def dashboardLink = '<a href=' + ctx.metadata.double_quate + dashboardUrl + ctx.metadata.double_quate + '>' + dashboard.title + '</a>';
    message += '<br />&emsp;&emsp;' + dashboardLink;
  }
}
message += '<br /><br />Detail';
for (def hit : ctx.payload.hits.hits) {
  def anomalyDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(hit._source.timestamp), ZoneId.of(ctx.metadata.locale));
  def anomalyDateStr = anomalyDate.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
  message += '<br />&emsp;&emsp;timestamp: ' + anomalyDateStr;
  def partitionName = hit._source.partition_field_name;
  String partitionValue = hit._source.partition_field_value;
  def detectorIndex = 0;
  def partitionFilter = '';
  double score = hit._source.record_score;
  message += '<br />&emsp;&emsp;function: ' + hit._source.function;
  message += '<br />&emsp;&emsp;description: ' + hit._source.function_description;
  message += '<br />&emsp;&emsp;field name: ' + hit._source.field_name;
  message += '<br />&emsp;&emsp;anomaly score: ' + score;
  def typical = hit._source.typical[0];
  def actual = hit._source.actual[0];
  message += '<br />&emsp;&emsp;actual: ' + actual;
  message += '<br />&emsp;&emsp;typical: ' + typical;
  message += '<br />&emsp;&emsp;probability: ' + hit._source.probability;
  if (hit._source.detector_index != null) {
    detectorIndex = hit._source.detector_index;
  }
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
    String partitionedSmvFilter = '&_a=(mlTimeSeriesExplorer:(detectorIndex:' + detectorIndex + ',entities:(' + partitionName + ':\\'' + escapedPartitionValue + '\\')))';
    String partitionedSmvUrl = ctx.metadata.kibana_url + 'app/ml#/timeseriesexplorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + longBeforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionedSmvFilter;
    String partitionedSmvLink = '<a href=' + ctx.metadata.double_quate + partitionedSmvUrl + ctx.metadata.double_quate + '>' + 'Single Metric Viewer</a>';
    message += '<br />&emsp;&emsp;partitions:<br />&emsp;&emsp;&emsp;&emsp;partition name: ' + partitionName + '<br />&emsp;&emsp;&emsp;&emsp;partition value: ' + partitionValue + '<br />&emsp;&emsp;&emsp;&emsp;' + partitionedSmvLink;
    def partitionQuery = '&_a=(filters:!(' + partitionFilter + '))';
    for (def dashboard : ctx.metadata.link_dashboards) {
      def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionQuery;
      def dashboardLink = '<a href=' + ctx.metadata.double_quate + dashboardUrl + ctx.metadata.double_quate + '>' + dashboard.title + '</a>';
      message += '<br />&emsp;&emsp;&emsp;&emsp;' + dashboardLink;
    }
  }

  // Saved Search URL
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
    message += '<br />&emsp;&emsp;<a href=' + ctx.metadata.double_quate + targetDiscoveryUrl + ctx.metadata.double_quate + '>Open Saved Search</a>';
    // Saved Search filtered by value
    def valQuery = makeFilter(hit);
    if (valQuery != '') {
      def queryFilterQuery = '';
      if (partitionName != null) {
        queryFilterQuery = '&_a=(filters:!(' + partitionFilter + ',' + valQuery + '))';
      } else {
        queryFilterQuery = '&_a=(filters:!(' + valQuery + '))';
      }
      def targetFilterDiscoveryUrl = discoveryUrl + timeQuery + queryFilterQuery;
      message += '<br />&emsp;&emsp;<a href=' + ctx.metadata.double_quate + targetFilterDiscoveryUrl + ctx.metadata.double_quate + '>Open Saved Search filtered by value</a>';
    }
  }
  message += '<br />';
}
return [ 'message' : message ];`;
export const scriptSlack=`// Non-ASCII character cannot be used in slack integration(6.1.0)
/**
 * Filter for max, high_mean, min and low_mean
 */
String makeFilter(def hit) {
  def rand = new Random();
  def vals = hit._source;
  def funcName = vals.function;
  def fieldName = vals.field_name;
  def fieldValue = vals.actual[0];
  def valFilterQuery = '';
  // max/high_mean
  // filter values greater than or equal to the actual value
  if (funcName == 'high_mean' || funcName == 'max') {
    def filterAlias = fieldName + '%20%E2%89%A5%20' + fieldValue;
    def rangeQuery = 'query:(range:(' + fieldName + ':(gte:' + fieldValue + ')))';
    valFilterQuery = '(meta:(alias:\\'' + filterAlias + '\\',disabled:!f,index:i' + rand.nextLong() + ',key:query,negate:!f,type:custom),' + rangeQuery + ')';
  }
  // min/low_mean
  // filter values lower than or equal to the actual value
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
def longBeforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000 - firstHit._source.bucket_span * 1000 * 100 - 1000 * 60 * 60 * 24;
def beforeDateMilli = firstHit._source.timestamp - ctx.metadata.kibana_display_term * 1000;
def afterDateMilli = firstHit._source.timestamp + ctx.metadata.kibana_display_term * 1000 + firstHit._source.bucket_span * 1000;
def longBeforeDate = Instant.ofEpochMilli(longBeforeDateMilli);
def beforeDate = Instant.ofEpochMilli(beforeDateMilli);
def afterDate = Instant.ofEpochMilli(afterDateMilli);
def url = ctx.metadata.kibana_url + 'app/ml#/explorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def link = '<' + url + '|Anomaly Explorer>';
def smvUrl = ctx.metadata.kibana_url + 'app/ml#/timeseriesexplorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + longBeforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))';
def smvLink = '<' + smvUrl + '|Single Metric Viewer>';
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
  def detectorIndex = 0;
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
  if (hit._source.detector_index != null) {
    detectorIndex = hit._source.detector_index;
  }
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
    String partitionedSmvFilter = '&_a=(mlTimeSeriesExplorer:(detectorIndex:' + detectorIndex + ',entities:(' + partitionName + ':\\'' + escapedPartitionValue + '\\')))';
    String partitionedSmvUrl = ctx.metadata.kibana_url + 'app/ml#/timeseriesexplorer?_g=(ml:(jobIds:!(\\'' + ctx.metadata.job_id + '\\')),time:(from:'+ ctx.metadata.quate + longBeforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionedSmvFilter;
    String partitionedSmvLink = '<' + partitionedSmvUrl + '|Single Metric Viewer>';
    message += '
  partitions:
    partition name: ' + partitionName + '
    partition value: ' + partitionValue + '
    ' + partitionedSmvLink;
    def partitionQuery = '&_a=(filters:!(' + partitionFilter + '))';
    for (def dashboard : ctx.metadata.link_dashboards) {
      def dashboardUrl = ctx.metadata.kibana_url + 'app/kibana#/dashboard/' + dashboard.id + '?_g=(time:(from:'+ ctx.metadata.quate + beforeDate + ctx.metadata.quate + ',mode:absolute,to:' + ctx.metadata.quate + afterDate + ctx.metadata.quate + '))' + partitionQuery;
      def dashboardLink = '<' + dashboardUrl + '|' + dashboard.title + '>';
      message += '
    ' + dashboardLink;
    }
  }

  // Saved Search URL
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
    // Saved Search filtered by value
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
export const scriptLine=`/**
 * Filter for max, high_mean, min and low_mean
 */
String mainTemplate = '%s
%s
Alert ID: %s
Description: %s
Alert Triggered Time: %s
ML JobID: %s

Detail:';

String detailTemplate = '  timestamp: %s
  function: %s
  description: %s
  field name: %s
  anomaly score: %.3f
  actual: %.3f
  typical: %.3f
  probability: %.6f
';

String partitionTemplate = '  partitions:
    partition name: %s
    partition value: %s
';

def dateForJpn = LocalDateTime.ofInstant(Instant.ofEpochMilli(ctx.execution_time.millis), ZoneId.of(ctx.metadata.locale));
def dateForJpnStr = dateForJpn.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
def firstHit = ctx.payload.hits.hits[0];
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
def values = new def[] {ctx.metadata.subject, severity, ctx.watch_id, ctx.metadata.description, dateForJpnStr, ctx.metadata.job_id};
def message = String.format(mainTemplate, values);

for (def hit : ctx.payload.hits.hits) {
  message += '
';
  def anomalyDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(hit._source.timestamp), ZoneId.of(ctx.metadata.locale));
  def anomalyDateStr = anomalyDate.format(DateTimeFormatter.ofPattern(ctx.metadata.date_format));
  def partitionName = hit._source.partition_field_name;
  String partitionValue = hit._source.partition_field_value;
  def detailValues = new def[] {anomalyDateStr, hit._source.function, hit._source.function_description, hit._source.field_name, hit._source.record_score, hit._source.actual[0], hit._source.typical[0], hit._source.probability};
  message += String.format(detailTemplate, detailValues);
  if (partitionName != null) {
    def partitionValues = new def[] {partitionName, partitionValue};
    message += String.format(partitionTemplate, partitionValues);
  }
}
return [ 'message' : message , 'severity' : severity ];`;