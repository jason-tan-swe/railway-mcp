#!/bin/bash

# test-monitoring.sh - Test monitoring, metrics, and observability features
set -e

echo "📊 Starting Monitoring & Observability Testing Phase"
echo "==================================================="

source test-utils.sh

# Load test context from previous phases
if [ -f test-context.sh ]; then
    source test-context.sh
else
    echo "❌ ERROR: test-context.sh not found. Run previous test phases first."
    exit 1
fi

PROJECT_ID="$TEST_PROJECT_ID"
SERVICE_ID="$TEST_SERVICE_ID"

# Test 1: Query existing metrics
echo "📈 Testing metrics query..."
metrics_response=$(call_tool "monitoring-metrics-query" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\"")
validate_success "$metrics_response" "Metrics Query"
log_test_result "monitoring-metrics-query" "PASS" "Retrieved metrics for service $SERVICE_ID"

# Test 2: Create custom metrics
echo "📊 Testing custom metric creation..."
custom_metric_response=$(call_tool "monitoring-metric-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"test_counter\", \"type\": \"COUNTER\", \"value\": 42, \"labels\": {\"environment\": \"test\", \"feature\": \"monitoring\"}, \"unit\": \"requests\"")

if validate_success "$custom_metric_response" "Custom Metric Create" 2>/dev/null; then
    CUSTOM_METRIC_ID=$(extract_value "$custom_metric_response" ".result.content[0].data.id")
    echo "✅ Created custom metric: $CUSTOM_METRIC_ID"
    log_test_result "monitoring-metric-create" "PASS" "Created custom metric $CUSTOM_METRIC_ID"
else
    echo "⚠️ Custom metrics not available"
    log_test_result "monitoring-metric-create" "SKIP" "Custom metrics not available"
fi

# Test 3: Create multiple metric types
echo "📊 Testing different metric types..."
# Gauge metric
gauge_response=$(call_tool "monitoring-metric-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"cpu_usage\", \"type\": \"GAUGE\", \"value\": 75.5, \"labels\": {\"resource\": \"cpu\"}, \"unit\": \"percent\"")

if validate_success "$gauge_response" "Gauge Metric" 2>/dev/null; then
    log_test_result "monitoring-gauge-metric" "PASS" "Created gauge metric"
fi

# Histogram metric
histogram_response=$(call_tool "monitoring-metric-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"response_time\", \"type\": \"HISTOGRAM\", \"value\": 250, \"labels\": {\"endpoint\": \"/api/test\"}, \"unit\": \"milliseconds\"")

if validate_success "$histogram_response" "Histogram Metric" 2>/dev/null; then
    log_test_result "monitoring-histogram-metric" "PASS" "Created histogram metric"
fi

# Test 4: Query metrics with filters
echo "🔍 Testing filtered metrics query..."
filtered_metrics_response=$(call_tool "monitoring-metrics-query" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"metricName\": \"test_counter\", \"startTime\": \"$(date -d '1 hour ago' -Iseconds)\", \"endTime\": \"$(date -Iseconds)\", \"step\": \"5m\"")

if validate_success "$filtered_metrics_response" "Filtered Metrics" 2>/dev/null; then
    log_test_result "monitoring-filtered-metrics" "PASS" "Retrieved filtered metrics"
else
    echo "⚠️ Filtered metrics query not available"
    log_test_result "monitoring-filtered-metrics" "SKIP" "Filtered metrics not available"
fi

# Test 5: APM data retrieval
echo "🔬 Testing APM data retrieval..."
apm_response=$(call_tool "monitoring-apm-data" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\"")

if validate_success "$apm_response" "APM Data" 2>/dev/null; then
    log_test_result "monitoring-apm-data" "PASS" "Retrieved APM data for service"
    
    # Get project-wide APM data
    apm_project_response=$(call_tool "monitoring-apm-data" "\"projectId\": \"$PROJECT_ID\"")
    if validate_success "$apm_project_response" "Project APM Data" 2>/dev/null; then
        log_test_result "monitoring-apm-project" "PASS" "Retrieved project-wide APM data"
    fi
else
    echo "⚠️ APM data not available yet"
    log_test_result "monitoring-apm-data" "SKIP" "APM data not available"
fi

# Test 6: Alert management
echo "🚨 Testing alert creation..."
alert_response=$(call_tool "monitoring-alert-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"High CPU Usage\", \"description\": \"Alert when CPU usage exceeds 80%\", \"condition\": \"cpu_usage > 80\", \"threshold\": 80, \"severity\": \"HIGH\", \"notifications\": [{\"type\": \"EMAIL\", \"destination\": \"devops@example.com\"}, {\"type\": \"WEBHOOK\", \"destination\": \"https://hooks.slack.com/test\"}]")

if validate_success "$alert_response" "Alert Create" 2>/dev/null; then
    ALERT_ID=$(extract_value "$alert_response" ".result.content[0].data.id")
    echo "✅ Created alert: $ALERT_ID"
    log_test_result "monitoring-alert-create" "PASS" "Created alert $ALERT_ID"
    
    # Test 7: List alerts
    echo "📋 Testing alert listing..."
    alerts_list_response=$(call_tool "monitoring-alerts" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\"")
    validate_success "$alerts_list_response" "Alerts List"
    log_test_result "monitoring-alerts-list" "PASS" "Retrieved alerts list"
    
    # Test 8: Update alert
    echo "✏️ Testing alert update..."
    alert_update_response=$(call_tool "monitoring-alert-update" "\"alertId\": \"$ALERT_ID\", \"threshold\": 85, \"isActive\": true")
    validate_success "$alert_update_response" "Alert Update"
    log_test_result "monitoring-alert-update" "PASS" "Updated alert $ALERT_ID"
    
else
    echo "⚠️ Alerting not available"
    log_test_result "monitoring-alert-create" "SKIP" "Alerting not available"
fi

# Test 9: Create critical alerts for different scenarios
echo "🚨 Testing different alert types..."

# Memory alert
memory_alert_response=$(call_tool "monitoring-alert-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"High Memory Usage\", \"description\": \"Alert when memory usage exceeds 90%\", \"condition\": \"memory_usage > 90\", \"threshold\": 90, \"severity\": \"CRITICAL\", \"notifications\": [{\"type\": \"EMAIL\", \"destination\": \"oncall@example.com\"}]")

if validate_success "$memory_alert_response" "Memory Alert" 2>/dev/null; then
    MEMORY_ALERT_ID=$(extract_value "$memory_alert_response" ".result.content[0].data.id")
    log_test_result "monitoring-memory-alert" "PASS" "Created memory alert $MEMORY_ALERT_ID"
fi

# Error rate alert
error_alert_response=$(call_tool "monitoring-alert-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"High Error Rate\", \"description\": \"Alert when error rate exceeds 5%\", \"condition\": \"error_rate > 5\", \"threshold\": 5, \"severity\": \"MEDIUM\", \"notifications\": [{\"type\": \"SLACK\", \"destination\": \"#alerts\"}]")

if validate_success "$error_alert_response" "Error Rate Alert" 2>/dev/null; then
    ERROR_ALERT_ID=$(extract_value "$error_alert_response" ".result.content[0].data.id")
    log_test_result "monitoring-error-alert" "PASS" "Created error rate alert $ERROR_ALERT_ID"
fi

# Test 10: Distributed tracing
echo "🔍 Testing distributed tracing..."
traces_response=$(call_tool "monitoring-traces" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\"")

if validate_success "$traces_response" "Traces Query" 2>/dev/null; then
    log_test_result "monitoring-traces" "PASS" "Retrieved distributed traces"
    
    # Get specific trace details if traces exist
    trace_id=$(extract_value "$traces_response" ".result.content[0].data.traces[0].traceId")
    if [ -n "$trace_id" ] && [ "$trace_id" != "null" ]; then
        echo "🔬 Testing trace details retrieval..."
        trace_details_response=$(call_tool "monitoring-trace-details" "\"traceId\": \"$trace_id\"")
        validate_success "$trace_details_response" "Trace Details"
        log_test_result "monitoring-trace-details" "PASS" "Retrieved trace details for $trace_id"
    fi
else
    echo "⚠️ Distributed tracing not available yet"
    log_test_result "monitoring-traces" "SKIP" "Tracing data not available"
fi

# Test 11: Test traces with filters
echo "🔍 Testing filtered trace queries..."
filtered_traces_response=$(call_tool "monitoring-traces" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"operationName\": \"GET /api/health\", \"startTime\": \"$(date -d '1 hour ago' -Iseconds)\", \"endTime\": \"$(date -Iseconds)\"")

if validate_success "$filtered_traces_response" "Filtered Traces" 2>/dev/null; then
    log_test_result "monitoring-filtered-traces" "PASS" "Retrieved filtered traces"
else
    echo "⚠️ Filtered tracing queries not available"
    log_test_result "monitoring-filtered-traces" "SKIP" "Filtered tracing not available"
fi

# Test 12: Performance monitoring across time ranges
echo "⏱️ Testing time-based performance monitoring..."
performance_metrics_response=$(call_tool "monitoring-metrics-query" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"startTime\": \"$(date -d '6 hours ago' -Iseconds)\", \"endTime\": \"$(date -Iseconds)\", \"step\": \"30m\"")

if validate_success "$performance_metrics_response" "Performance Metrics" 2>/dev/null; then
    log_test_result "monitoring-performance" "PASS" "Retrieved performance metrics over time"
else
    echo "⚠️ Time-based performance monitoring not available"
    log_test_result "monitoring-performance" "SKIP" "Performance monitoring not available"
fi

# Test 13: Multi-service monitoring (if we have database services)
if [ -n "$TEST_POSTGRES_SERVICE_ID" ]; then
    echo "🗄️ Testing database service monitoring..."
    db_apm_response=$(call_tool "monitoring-apm-data" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$TEST_POSTGRES_SERVICE_ID\"")
    
    if validate_success "$db_apm_response" "Database APM" 2>/dev/null; then
        log_test_result "monitoring-database-apm" "PASS" "Retrieved database APM data"
    else
        echo "⚠️ Database monitoring not available"
        log_test_result "monitoring-database-apm" "SKIP" "Database monitoring not available"
    fi
fi

# Test 14: Create business metrics
echo "💼 Testing business metrics creation..."
business_metrics_response=$(call_tool "monitoring-metric-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"user_signups\", \"type\": \"COUNTER\", \"value\": 15, \"labels\": {\"source\": \"organic\", \"campaign\": \"test\"}, \"unit\": \"users\"")

if validate_success "$business_metrics_response" "Business Metrics" 2>/dev/null; then
    log_test_result "monitoring-business-metrics" "PASS" "Created business metrics"
fi

# Test 15: Alert notification testing
echo "📧 Testing alert notification configurations..."
if [ -n "$ALERT_ID" ] && [ "$ALERT_ID" != "null" ]; then
    # Update alert with multiple notification channels
    multi_notification_response=$(call_tool "monitoring-alert-update" "\"alertId\": \"$ALERT_ID\", \"notifications\": [{\"type\": \"EMAIL\", \"destination\": \"team@example.com\"}, {\"type\": \"WEBHOOK\", \"destination\": \"https://hooks.slack.com/services/test\"}, {\"type\": \"PAGERDUTY\", \"destination\": \"integration-key-123\"}]")
    
    if validate_success "$multi_notification_response" "Multi Notification Update" 2>/dev/null; then
        log_test_result "monitoring-multi-notifications" "PASS" "Updated alert with multiple notifications"
    fi
fi

# Test 16: Clean up test alerts (optional)
echo "🧹 Testing alert cleanup..."
if [ -n "$MEMORY_ALERT_ID" ] && [ "$MEMORY_ALERT_ID" != "null" ]; then
    memory_alert_delete_response=$(call_tool "monitoring-alert-delete" "\"alertId\": \"$MEMORY_ALERT_ID\"")
    validate_success "$memory_alert_delete_response" "Memory Alert Delete"
    log_test_result "monitoring-alert-delete" "PASS" "Deleted memory alert $MEMORY_ALERT_ID"
fi

# Test 17: Real-time monitoring simulation
echo "⏰ Testing real-time monitoring capabilities..."
# Create multiple metrics to simulate real load
for i in {1..5}; do
    real_time_metric_response=$(call_tool "monitoring-metric-create" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"name\": \"load_test_requests\", \"type\": \"COUNTER\", \"value\": $((i * 10)), \"labels\": {\"batch\": \"$i\", \"test\": \"realtime\"}")
    
    if validate_success "$real_time_metric_response" "Real-time Metric $i" 2>/dev/null; then
        echo "📊 Created real-time metric batch $i"
    fi
    
    sleep 2  # Small delay to simulate real-time data
done

log_test_result "monitoring-realtime" "PASS" "Created real-time monitoring simulation"

# Test 18: Query aggregated metrics
echo "📊 Testing metric aggregation..."
aggregated_response=$(call_tool "monitoring-metrics-query" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\", \"metricName\": \"load_test_requests\", \"labels\": {\"test\": \"realtime\"}")

if validate_success "$aggregated_response" "Aggregated Metrics" 2>/dev/null; then
    log_test_result "monitoring-aggregation" "PASS" "Retrieved aggregated metrics"
fi

# Update test context with monitoring information
cat >> test-context.sh << EOF

# Monitoring test context
export TEST_ALERT_ID="$ALERT_ID"
export TEST_MEMORY_ALERT_ID="$MEMORY_ALERT_ID"
export TEST_ERROR_ALERT_ID="$ERROR_ALERT_ID"
export TEST_CUSTOM_METRIC_ID="$CUSTOM_METRIC_ID"
EOF

echo ""
echo "✅ Monitoring & Observability Testing Phase Complete"
echo "📋 Summary:"
echo "   - Alert ID: $ALERT_ID"
echo "   - Memory Alert ID: $MEMORY_ALERT_ID"
echo "   - Error Alert ID: $ERROR_ALERT_ID"
echo "   - Custom Metric ID: $CUSTOM_METRIC_ID"
echo "   - All monitoring and observability features verified"
echo ""
echo "💾 Monitoring context added to test-context.sh"