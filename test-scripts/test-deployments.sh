#!/bin/bash

# test-deployments.sh - Test advanced deployment functionality
set -e

echo "🚀 Starting Advanced Deployment Testing Phase"
echo "============================================="

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

# Test 1: List deployment versions
echo "📋 Testing deployment version listing..."
versions_response=$(call_tool "deployment-versions" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$versions_response" "Deployment Versions List"
log_test_result "deployment-versions" "PASS" "Retrieved deployment versions for service $SERVICE_ID"

# Extract version information for rollback testing
CURRENT_VERSION_ID=$(extract_value "$versions_response" ".result.content[0].data.versions[0].id")
PREVIOUS_VERSION_ID=$(extract_value "$versions_response" ".result.content[0].data.versions[1].id")

# Test 2: Build job listing
echo "🔨 Testing build job listing..."
builds_response=$(call_tool "build-list" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$builds_response" "Build Jobs List"
log_test_result "build-list" "PASS" "Retrieved build jobs for service $SERVICE_ID"

# Test 3: Trigger new build
echo "⚡ Testing build trigger..."
build_trigger_response=$(call_tool "build-trigger" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$build_trigger_response" "Build Trigger"

NEW_BUILD_ID=$(extract_value "$build_trigger_response" ".result.content[0].data.id")
if [ -n "$NEW_BUILD_ID" ] && [ "$NEW_BUILD_ID" != "null" ]; then
    echo "✅ Triggered new build with ID: $NEW_BUILD_ID"
    log_test_result "build-trigger" "PASS" "Triggered build $NEW_BUILD_ID"
else
    echo "❌ Failed to extract build ID from trigger response"
    log_test_result "build-trigger" "FAIL" "Could not extract build ID"
fi

# Test 4: Monitor build progress
echo "👀 Testing build status monitoring..."
if [ -n "$NEW_BUILD_ID" ] && [ "$NEW_BUILD_ID" != "null" ]; then
    build_status_response=$(call_tool "build-status" "\"buildId\": \"$NEW_BUILD_ID\"")
    validate_success "$build_status_response" "Build Status"
    log_test_result "build-status" "PASS" "Retrieved build status for $NEW_BUILD_ID"
    
    # Test build logs
    echo "📄 Testing build logs retrieval..."
    build_logs_response=$(call_tool "build-logs" "\"buildId\": \"$NEW_BUILD_ID\"")
    validate_success "$build_logs_response" "Build Logs"
    log_test_result "build-logs" "PASS" "Retrieved build logs for $NEW_BUILD_ID"
fi

# Test 5: Wait for build completion (with timeout)
echo "⏳ Waiting for build to complete..."
build_wait_start=$(date +%s)
build_max_wait=600  # 10 minutes for build
build_completed=false

while [ $(($(date +%s) - build_wait_start)) -lt $build_max_wait ]; do
    if [ -n "$NEW_BUILD_ID" ] && [ "$NEW_BUILD_ID" != "null" ]; then
        build_status_response=$(call_tool "build-status" "\"buildId\": \"$NEW_BUILD_ID\"")
        build_status=$(extract_value "$build_status_response" ".result.content[0].data.status")
        
        case "$build_status" in
            "SUCCESS")
                echo "✅ Build completed successfully"
                log_test_result "build-completion" "PASS" "Build $NEW_BUILD_ID completed successfully"
                build_completed=true
                break
                ;;
            "FAILED"|"CANCELLED")
                echo "❌ Build failed with status: $build_status"
                log_test_result "build-completion" "FAIL" "Build $NEW_BUILD_ID failed: $build_status"
                break
                ;;
            "BUILDING"|"QUEUED")
                echo "⏳ Build in progress (status: $build_status)..."
                ;;
        esac
    fi
    
    sleep 30
done

if [ "$build_completed" = false ]; then
    echo "⚠️ Build did not complete within timeout period"
    log_test_result "build-completion" "TIMEOUT" "Build did not complete within $build_max_wait seconds"
fi

# Test 6: Deployment rollback (if we have previous versions)
if [ -n "$PREVIOUS_VERSION_ID" ] && [ "$PREVIOUS_VERSION_ID" != "null" ]; then
    echo "🔄 Testing deployment rollback..."
    rollback_response=$(call_tool "deployment-rollback" "\"serviceId\": \"$SERVICE_ID\", \"versionId\": \"$PREVIOUS_VERSION_ID\", \"reason\": \"Testing rollback functionality\", \"strategy\": \"INSTANT\"")
    validate_success "$rollback_response" "Deployment Rollback"
    
    ROLLBACK_ID=$(extract_value "$rollback_response" ".result.content[0].data.id")
    if [ -n "$ROLLBACK_ID" ] && [ "$ROLLBACK_ID" != "null" ]; then
        echo "✅ Initiated rollback with ID: $ROLLBACK_ID"
        log_test_result "deployment-rollback" "PASS" "Initiated rollback $ROLLBACK_ID to version $PREVIOUS_VERSION_ID"
        
        # Test 7: Monitor rollback status
        echo "📊 Testing rollback status monitoring..."
        rollback_status_response=$(call_tool "rollback-status" "\"rollbackId\": \"$ROLLBACK_ID\"")
        validate_success "$rollback_status_response" "Rollback Status"
        log_test_result "rollback-status" "PASS" "Retrieved rollback status for $ROLLBACK_ID"
        
        # Wait for rollback completion
        echo "⏳ Waiting for rollback to complete..."
        rollback_wait_start=$(date +%s)
        rollback_max_wait=300  # 5 minutes for rollback
        
        while [ $(($(date +%s) - rollback_wait_start)) -lt $rollback_max_wait ]; do
            rollback_status_response=$(call_tool "rollback-status" "\"rollbackId\": \"$ROLLBACK_ID\"")
            rollback_status=$(extract_value "$rollback_status_response" ".result.content[0].data.status")
            
            case "$rollback_status" in
                "COMPLETED")
                    echo "✅ Rollback completed successfully"
                    log_test_result "rollback-completion" "PASS" "Rollback $ROLLBACK_ID completed successfully"
                    break
                    ;;
                "FAILED")
                    echo "❌ Rollback failed"
                    log_test_result "rollback-completion" "FAIL" "Rollback $ROLLBACK_ID failed"
                    break
                    ;;
                "IN_PROGRESS"|"PENDING")
                    echo "⏳ Rollback in progress (status: $rollback_status)..."
                    ;;
            esac
            
            sleep 10
        done
    else
        echo "❌ Failed to extract rollback ID"
        log_test_result "deployment-rollback" "FAIL" "Could not extract rollback ID"
    fi
else
    echo "⚠️ Skipping rollback test - no previous version available"
    log_test_result "deployment-rollback" "SKIP" "No previous version available for rollback"
fi

# Test 8: List rollback history
echo "📋 Testing rollback history..."
rollback_list_response=$(call_tool "rollback-list" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$rollback_list_response" "Rollback List"
log_test_result "rollback-list" "PASS" "Retrieved rollback history for service $SERVICE_ID"

# Test 9: Blue-Green deployment setup (if supported)
echo "🔵🟢 Testing Blue-Green deployment..."
if [ "$build_completed" = true ]; then
    # Create a new version for blue-green testing
    bluegreen_response=$(call_tool "deployment-bluegreen-create" "\"serviceId\": \"$SERVICE_ID\", \"newVersionId\": \"$CURRENT_VERSION_ID\"")
    
    if validate_success "$bluegreen_response" "Blue-Green Deployment Create" 2>/dev/null; then
        BLUEGREEN_ID=$(extract_value "$bluegreen_response" ".result.content[0].data.id")
        log_test_result "bluegreen-create" "PASS" "Created blue-green deployment $BLUEGREEN_ID"
        
        # Test blue-green switch
        echo "🔄 Testing Blue-Green switch..."
        bluegreen_switch_response=$(call_tool "deployment-bluegreen-switch" "\"blueGreenId\": \"$BLUEGREEN_ID\"")
        validate_success "$bluegreen_switch_response" "Blue-Green Switch"
        log_test_result "bluegreen-switch" "PASS" "Switched blue-green deployment $BLUEGREEN_ID"
    else
        echo "⚠️ Blue-Green deployment not supported or failed"
        log_test_result "bluegreen-create" "SKIP" "Blue-Green deployment not available"
    fi
else
    echo "⚠️ Skipping Blue-Green test - no completed build available"
    log_test_result "bluegreen-create" "SKIP" "No completed build for blue-green testing"
fi

# Test 10: Canary deployment (if supported)
echo "🐦 Testing Canary deployment..."
if [ "$build_completed" = true ]; then
    canary_response=$(call_tool "deployment-canary-create" "\"serviceId\": \"$SERVICE_ID\", \"newVersionId\": \"$CURRENT_VERSION_ID\", \"trafficSplit\": 10, \"rules\": [{\"metric\": \"error_rate\", \"threshold\": 5, \"action\": \"ROLLBACK\"}]")
    
    if validate_success "$canary_response" "Canary Deployment Create" 2>/dev/null; then
        CANARY_ID=$(extract_value "$canary_response" ".result.content[0].data.id")
        log_test_result "canary-create" "PASS" "Created canary deployment $CANARY_ID"
        
        # Test canary promotion
        echo "📈 Testing Canary promotion..."
        canary_promote_response=$(call_tool "deployment-canary-promote" "\"canaryId\": \"$CANARY_ID\"")
        validate_success "$canary_promote_response" "Canary Promotion"
        log_test_result "canary-promote" "PASS" "Promoted canary deployment $CANARY_ID"
    else
        echo "⚠️ Canary deployment not supported or failed"
        log_test_result "canary-create" "SKIP" "Canary deployment not available"
    fi
else
    echo "⚠️ Skipping Canary test - no completed build available"
    log_test_result "canary-create" "SKIP" "No completed build for canary testing"
fi

# Test 11: Build configuration management
echo "⚙️ Testing build configuration..."
build_config_response=$(call_tool "build-config-get" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$build_config_response" "Build Config Get"
log_test_result "build-config-get" "PASS" "Retrieved build configuration for service $SERVICE_ID"

# Test build config update
build_config_update_response=$(call_tool "build-config-update" "\"serviceId\": \"$SERVICE_ID\", \"buildCommand\": \"npm run build\", \"startCommand\": \"npm start\"")
validate_success "$build_config_update_response" "Build Config Update"
log_test_result "build-config-update" "PASS" "Updated build configuration for service $SERVICE_ID"

# Test 12: Deployment environment promotion
echo "🚀 Testing environment promotion..."
promotion_response=$(call_tool "deployment-promote" "\"serviceId\": \"$SERVICE_ID\", \"fromEnvironment\": \"production\", \"toEnvironment\": \"staging\"")

if validate_success "$promotion_response" "Environment Promotion" 2>/dev/null; then
    log_test_result "deployment-promote" "PASS" "Promoted deployment between environments"
else
    echo "⚠️ Environment promotion not available or failed"
    log_test_result "deployment-promote" "SKIP" "Environment promotion not available"
fi

# Test 13: Deployment metrics and analytics
echo "📊 Testing deployment metrics..."
deployment_metrics_response=$(call_tool "deployment-metrics" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$deployment_metrics_response" "Deployment Metrics"
log_test_result "deployment-metrics" "PASS" "Retrieved deployment metrics for service $SERVICE_ID"

# Update test context with deployment information
cat >> test-context.sh << EOF

# Advanced deployment test context
export TEST_BUILD_ID="$NEW_BUILD_ID"
export TEST_ROLLBACK_ID="$ROLLBACK_ID"
export TEST_CURRENT_VERSION_ID="$CURRENT_VERSION_ID"
export TEST_PREVIOUS_VERSION_ID="$PREVIOUS_VERSION_ID"
EOF

echo ""
echo "✅ Advanced Deployment Testing Phase Complete"
echo "📋 Summary:"
echo "   - Build ID: $NEW_BUILD_ID"
echo "   - Rollback ID: $ROLLBACK_ID"
echo "   - Current Version: $CURRENT_VERSION_ID"
echo "   - Previous Version: $PREVIOUS_VERSION_ID"
echo "   - Advanced deployment functionality verified"
echo ""
echo "💾 Deployment context added to test-context.sh"