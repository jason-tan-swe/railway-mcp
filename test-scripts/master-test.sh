#!/bin/bash

# master-test.sh - Execute complete Railway MCP Server test suite
set -e

echo "🚀 Railway MCP Server - Complete Test Suite"
echo "==========================================="
echo "📅 Started at: $(date)"
echo ""

# Check prerequisites
if [ -z "$RAILWAY_API_TOKEN" ]; then
    echo "❌ ERROR: RAILWAY_API_TOKEN environment variable not set"
    echo "Please set your Railway API token: export RAILWAY_API_TOKEN='your-token-here'"
    exit 1
fi

# Create test session ID for tracking
TEST_SESSION_ID="test-$(date +%Y%m%d-%H%M%S)"
echo "🆔 Test Session ID: $TEST_SESSION_ID"

# Change to script directory
cd "$(dirname "$0")"

# Setup test environment
echo "⚙️ Setting up test environment..."
chmod +x *.sh
./test-setup.sh

# Initialize test results tracking
echo "📊 Initializing test tracking..."
echo "Test Session: $TEST_SESSION_ID" > test-results/session-summary.txt
echo "Started: $(date)" >> test-results/session-summary.txt
echo "" >> test-results/session-summary.txt

# Track overall test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

run_test_phase() {
    local phase_name="$1"
    local script_name="$2"
    local phase_start_time=$(date +%s)
    
    echo ""
    echo "🔄 Phase: $phase_name"
    echo "========================================"
    
    if [ ! -f "$script_name" ]; then
        echo "❌ ERROR: Test script $script_name not found"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    echo "$phase_name: STARTED at $(date)" >> test-results/session-summary.txt
    
    if ./"$script_name" 2>&1 | tee "test-logs/$phase_name.log"; then
        local phase_end_time=$(date +%s)
        local phase_duration=$((phase_end_time - phase_start_time))
        
        echo "✅ $phase_name completed successfully in ${phase_duration}s"
        echo "$phase_name: PASSED (${phase_duration}s)" >> test-results/session-summary.txt
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        local phase_end_time=$(date +%s)
        local phase_duration=$((phase_end_time - phase_start_time))
        
        echo "❌ $phase_name failed after ${phase_duration}s"
        echo "$phase_name: FAILED (${phase_duration}s)" >> test-results/session-summary.txt
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Execute test phases
echo "🚀 Beginning test execution..."

# Phase 1: Foundation Testing
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Foundation" "test-foundation.sh"

# Phase 2: Database Testing  
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Database_Storage" "test-databases.sh"

# Phase 3: Advanced Deployment Testing
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Advanced_Deployments" "test-deployments.sh"

# Phase 4: Enterprise Features Testing
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Enterprise_Features" "test-enterprise.sh"

# Phase 5: Monitoring Testing
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Monitoring_Observability" "test-monitoring.sh"

# Phase 6: Networking Testing
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Networking_Infrastructure" "test-networking.sh"

# Phase 7: Integration Testing
TOTAL_TESTS=$((TOTAL_TESTS + 1))
run_test_phase "Integration_EndToEnd" "test-integration.sh"

# Calculate final results
END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))

# Generate final report
echo ""
echo "📊 FINAL TEST RESULTS"
echo "===================="
echo "🆔 Session ID: $TEST_SESSION_ID"
echo "⏱️ Total Duration: ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60))m $(($TOTAL_DURATION % 60))s)"
echo "✅ Passed: $PASSED_TESTS/$TOTAL_TESTS"
echo "❌ Failed: $FAILED_TESTS/$TOTAL_TESTS"
echo "📈 Success Rate: $SUCCESS_RATE%"
echo ""

# Write final summary
cat >> test-results/session-summary.txt << EOF

FINAL RESULTS:
=============
Session ID: $TEST_SESSION_ID
Total Duration: ${TOTAL_DURATION}s
Passed: $PASSED_TESTS/$TOTAL_TESTS
Failed: $FAILED_TESTS/$TOTAL_TESTS  
Success Rate: $SUCCESS_RATE%
Completed: $(date)
EOF

# Generate detailed test report
echo "📋 Generating detailed test report..."
cat > test-results/detailed-report.md << EOF
# Railway MCP Server Test Report

**Session ID:** $TEST_SESSION_ID  
**Date:** $(date)  
**Duration:** ${TOTAL_DURATION}s  
**Success Rate:** $SUCCESS_RATE%

## Test Results Summary

| Phase | Status | Duration |
|-------|--------|----------|
EOF

# Add phase results to report
grep ": " test-results/session-summary.txt | grep -E "(PASSED|FAILED)" | while read line; do
    phase=$(echo "$line" | cut -d':' -f1)
    status=$(echo "$line" | cut -d':' -f2 | cut -d'(' -f1 | xargs)
    duration=$(echo "$line" | grep -o '([0-9]*s)' | tr -d '()')
    
    if [ "$status" = "PASSED" ]; then
        echo "| $phase | ✅ PASSED | $duration |" >> test-results/detailed-report.md
    else
        echo "| $phase | ❌ FAILED | $duration |" >> test-results/detailed-report.md
    fi
done

cat >> test-results/detailed-report.md << EOF

## Individual Test Results

EOF

# Add individual test results if available
if [ -f test-results/test-log.txt ]; then
    echo "### Detailed Test Log" >> test-results/detailed-report.md
    echo "\`\`\`" >> test-results/detailed-report.md
    cat test-results/test-log.txt >> test-results/detailed-report.md
    echo "\`\`\`" >> test-results/detailed-report.md
fi

# Cleanup option
echo ""
echo "🧹 Test Cleanup Options:"
echo "1. Keep test resources for manual inspection"
echo "2. Cleanup all test resources now"
echo "3. Cleanup later (manual)"
echo ""

read -p "Choose option (1-3) [default: 3]: " cleanup_choice

case "$cleanup_choice" in
    "2")
        echo "🗑️ Cleaning up test resources..."
        source test-utils.sh
        cleanup_test_resources
        echo "✅ Cleanup completed"
        ;;
    "1")
        echo "📝 Test resources preserved for inspection"
        echo "💡 To cleanup later, run: source test-utils.sh && cleanup_test_resources"
        ;;
    *)
        echo "📝 Manual cleanup required"
        echo "💡 To cleanup, run: source test-utils.sh && cleanup_test_resources"
        ;;
esac

# Final status
echo ""
if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Railway MCP Server is functioning correctly."
    exit 0
else
    echo "⚠️ Some tests failed. Check test-logs/ and test-results/ for details."
    echo "📁 Logs location: test-logs/"
    echo "📋 Results location: test-results/"
    exit 1
fi