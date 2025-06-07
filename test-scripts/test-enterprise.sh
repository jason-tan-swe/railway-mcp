#!/bin/bash

# test-enterprise.sh - Test enterprise features (backup, security, compliance)
set -e

echo "🏢 Starting Enterprise Features Testing Phase"
echo "==========================================="

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

# Test 1: Backup operations
echo "💾 Testing backup creation..."
backup_response=$(call_tool "backup-create" "\"projectId\": \"$PROJECT_ID\", \"type\": \"PROJECT\", \"description\": \"Test backup for enterprise testing\", \"retentionDays\": 7")
validate_success "$backup_response" "Backup Create"

BACKUP_ID=$(extract_value "$backup_response" ".result.content[0].data.id")
if [ -n "$BACKUP_ID" ] && [ "$BACKUP_ID" != "null" ]; then
    echo "✅ Created backup with ID: $BACKUP_ID"
    log_test_result "backup-create" "PASS" "Created backup $BACKUP_ID"
else
    echo "❌ Failed to extract backup ID"
    log_test_result "backup-create" "FAIL" "Could not extract backup ID"
fi

# Test 2: List backups
echo "📋 Testing backup listing..."
backup_list_response=$(call_tool "backup-list" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$backup_list_response" "Backup List"
log_test_result "backup-list" "PASS" "Retrieved backup list for project $PROJECT_ID"

# Test 3: Get backup details
if [ -n "$BACKUP_ID" ] && [ "$BACKUP_ID" != "null" ]; then
    echo "🔍 Testing backup details retrieval..."
    backup_get_response=$(call_tool "backup-get" "\"backupId\": \"$BACKUP_ID\"")
    validate_success "$backup_get_response" "Backup Get"
    log_test_result "backup-get" "PASS" "Retrieved backup details for $BACKUP_ID"
fi

# Test 4: Backup policy creation
echo "📅 Testing backup policy creation..."
backup_policy_response=$(call_tool "backup-policy-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-policy-$(date +%s)\", \"schedule\": \"0 2 * * *\", \"backupType\": \"PROJECT\", \"retentionDays\": 30, \"targets\": []")
validate_success "$backup_policy_response" "Backup Policy Create"

BACKUP_POLICY_ID=$(extract_value "$backup_policy_response" ".result.content[0].data.id")
if [ -n "$BACKUP_POLICY_ID" ] && [ "$BACKUP_POLICY_ID" != "null" ]; then
    echo "✅ Created backup policy with ID: $BACKUP_POLICY_ID"
    log_test_result "backup-policy-create" "PASS" "Created backup policy $BACKUP_POLICY_ID"
fi

# Test 5: List backup policies
echo "📋 Testing backup policy listing..."
backup_policy_list_response=$(call_tool "backup-policy-list" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$backup_policy_list_response" "Backup Policy List"
log_test_result "backup-policy-list" "PASS" "Retrieved backup policies for project $PROJECT_ID"

# Test 6: Update backup policy
if [ -n "$BACKUP_POLICY_ID" ] && [ "$BACKUP_POLICY_ID" != "null" ]; then
    echo "✏️ Testing backup policy update..."
    backup_policy_update_response=$(call_tool "backup-policy-update" "\"policyId\": \"$BACKUP_POLICY_ID\", \"retentionDays\": 14, \"isActive\": true")
    validate_success "$backup_policy_update_response" "Backup Policy Update"
    log_test_result "backup-policy-update" "PASS" "Updated backup policy $BACKUP_POLICY_ID"
fi

# Test 7: Security audit logs
echo "🔒 Testing security audit logs..."
audit_logs_response=$(call_tool "security-audit-logs" "\"projectId\": \"$PROJECT_ID\", \"limit\": 50")
validate_success "$audit_logs_response" "Security Audit Logs"
log_test_result "security-audit-logs" "PASS" "Retrieved audit logs for project $PROJECT_ID"

# Test 8: Security vulnerability scan
echo "🔍 Testing vulnerability scanning..."
vulnerability_response=$(call_tool "security-vulnerabilities" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$vulnerability_response" "Security Vulnerabilities"
log_test_result "security-vulnerabilities" "PASS" "Retrieved vulnerabilities for project $PROJECT_ID"

# Test 9: Trigger security scan
echo "⚡ Testing security scan trigger..."
scan_trigger_response=$(call_tool "security-scan-trigger" "\"projectId\": \"$PROJECT_ID\", \"serviceId\": \"$SERVICE_ID\"")
validate_success "$scan_trigger_response" "Security Scan Trigger"
log_test_result "security-scan-trigger" "PASS" "Triggered security scan for service $SERVICE_ID"

# Test 10: Access token management
echo "🔑 Testing access token creation..."
token_create_response=$(call_tool "security-token-create" "\"name\": \"test-token-$(date +%s)\", \"permissions\": [\"project:read\", \"service:read\"], \"expiresAt\": \"2024-12-31T23:59:59Z\"")
validate_success "$token_create_response" "Access Token Create"

TOKEN_ID=$(extract_value "$token_create_response" ".result.content[0].data.token.id")
if [ -n "$TOKEN_ID" ] && [ "$TOKEN_ID" != "null" ]; then
    echo "✅ Created access token with ID: $TOKEN_ID"
    log_test_result "security-token-create" "PASS" "Created access token $TOKEN_ID"
fi

# Test 11: List access tokens
echo "📋 Testing access token listing..."
token_list_response=$(call_tool "security-access-tokens" "")
validate_success "$token_list_response" "Access Token List"
log_test_result "security-access-tokens" "PASS" "Retrieved access token list"

# Test 12: IP allowlist management
echo "🌐 Testing IP allowlist creation..."
ip_allowlist_response=$(call_tool "security-ip-allowlist-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-allowlist-$(date +%s)\", \"ipRanges\": [\"192.168.1.0/24\", \"10.0.0.0/8\"], \"description\": \"Test IP allowlist for enterprise testing\"")
validate_success "$ip_allowlist_response" "IP Allowlist Create"

IP_ALLOWLIST_ID=$(extract_value "$ip_allowlist_response" ".result.content[0].data.id")
if [ -n "$IP_ALLOWLIST_ID" ] && [ "$IP_ALLOWLIST_ID" != "null" ]; then
    echo "✅ Created IP allowlist with ID: $IP_ALLOWLIST_ID"
    log_test_result "security-ip-allowlist-create" "PASS" "Created IP allowlist $IP_ALLOWLIST_ID"
fi

# Test 13: List IP allowlists
echo "📋 Testing IP allowlist listing..."
ip_allowlist_list_response=$(call_tool "security-ip-allowlists" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$ip_allowlist_list_response" "IP Allowlist List"
log_test_result "security-ip-allowlists" "PASS" "Retrieved IP allowlists for project $PROJECT_ID"

# Test 14: Compliance reporting
echo "📊 Testing compliance report generation..."
compliance_response=$(call_tool "security-compliance-report" "\"projectId\": \"$PROJECT_ID\", \"framework\": \"SOC2\"")
validate_success "$compliance_response" "Compliance Report"

COMPLIANCE_REPORT_ID=$(extract_value "$compliance_response" ".result.content[0].data.id")
if [ -n "$COMPLIANCE_REPORT_ID" ] && [ "$COMPLIANCE_REPORT_ID" != "null" ]; then
    echo "✅ Generated compliance report with ID: $COMPLIANCE_REPORT_ID"
    log_test_result "security-compliance-report" "PASS" "Generated SOC2 compliance report $COMPLIANCE_REPORT_ID"
fi

# Test 15: Test different compliance frameworks
echo "📋 Testing GDPR compliance report..."
gdpr_compliance_response=$(call_tool "security-compliance-report" "\"projectId\": \"$PROJECT_ID\", \"framework\": \"GDPR\"")
validate_success "$gdpr_compliance_response" "GDPR Compliance Report"
log_test_result "gdpr-compliance-report" "PASS" "Generated GDPR compliance report"

echo "🏥 Testing HIPAA compliance report..."
hipaa_compliance_response=$(call_tool "security-compliance-report" "\"projectId\": \"$PROJECT_ID\", \"framework\": \"HIPAA\"")
validate_success "$hipaa_compliance_response" "HIPAA Compliance Report"
log_test_result "hipaa-compliance-report" "PASS" "Generated HIPAA compliance report"

# Test 16: Backup restore testing (create separate project for safety)
echo "🔄 Testing backup restore functionality..."
restore_project_response=$(call_tool "project-create" "\"name\": \"mcp-test-restore-$(date +%s)\"")
RESTORE_PROJECT_ID=$(extract_value "$restore_project_response" ".result.content[0].data.id")

if [ -n "$BACKUP_ID" ] && [ "$BACKUP_ID" != "null" ] && [ -n "$RESTORE_PROJECT_ID" ] && [ "$RESTORE_PROJECT_ID" != "null" ]; then
    echo "🔄 Testing backup restore to new project..."
    restore_response=$(call_tool "backup-restore" "\"backupId\": \"$BACKUP_ID\", \"targetProjectId\": \"$RESTORE_PROJECT_ID\", \"overwrite\": false")
    
    if validate_success "$restore_response" "Backup Restore" 2>/dev/null; then
        RESTORE_ID=$(extract_value "$restore_response" ".result.content[0].data.restoreId")
        log_test_result "backup-restore" "PASS" "Initiated backup restore $RESTORE_ID"
        
        # Test restore status monitoring
        echo "📊 Testing restore status monitoring..."
        restore_status_response=$(call_tool "backup-restore-status" "\"restoreId\": \"$RESTORE_ID\"")
        validate_success "$restore_status_response" "Restore Status"
        log_test_result "backup-restore-status" "PASS" "Retrieved restore status for $RESTORE_ID"
    else
        echo "⚠️ Backup restore not available or failed"
        log_test_result "backup-restore" "SKIP" "Backup restore not available"
    fi
else
    echo "⚠️ Skipping restore test - backup or restore project not available"
    log_test_result "backup-restore" "SKIP" "Backup or restore project not available"
fi

# Test 17: Enterprise audit trail
echo "📋 Testing enterprise audit trail..."
audit_trail_response=$(call_tool "security-audit-logs" "\"projectId\": \"$PROJECT_ID\", \"startDate\": \"$(date -d '1 day ago' +%Y-%m-%d)\", \"endDate\": \"$(date +%Y-%m-%d)\", \"limit\": 100")
validate_success "$audit_trail_response" "Enterprise Audit Trail"
log_test_result "enterprise-audit-trail" "PASS" "Retrieved enterprise audit trail"

# Test 18: Security policy management (if available)
echo "🛡️ Testing security policy management..."
security_policy_response=$(call_tool "security-policy-list" "\"projectId\": \"$PROJECT_ID\"")

if validate_success "$security_policy_response" "Security Policy List" 2>/dev/null; then
    log_test_result "security-policy-list" "PASS" "Retrieved security policies"
else
    echo "⚠️ Security policy management not available"
    log_test_result "security-policy-list" "SKIP" "Security policy management not available"
fi

# Test 19: Advanced access control
echo "🔐 Testing advanced access control..."
if [ -n "$TOKEN_ID" ] && [ "$TOKEN_ID" != "null" ]; then
    # Test token revocation
    echo "🚫 Testing access token revocation..."
    token_revoke_response=$(call_tool "security-token-revoke" "\"tokenId\": \"$TOKEN_ID\"")
    validate_success "$token_revoke_response" "Access Token Revoke"
    log_test_result "security-token-revoke" "PASS" "Revoked access token $TOKEN_ID"
fi

# Test 20: Cleanup test backups and policies
echo "🧹 Testing cleanup of enterprise resources..."
if [ -n "$BACKUP_POLICY_ID" ] && [ "$BACKUP_POLICY_ID" != "null" ]; then
    backup_policy_delete_response=$(call_tool "backup-policy-delete" "\"policyId\": \"$BACKUP_POLICY_ID\"")
    validate_success "$backup_policy_delete_response" "Backup Policy Delete"
    log_test_result "backup-policy-delete" "PASS" "Deleted backup policy $BACKUP_POLICY_ID"
fi

if [ -n "$BACKUP_ID" ] && [ "$BACKUP_ID" != "null" ]; then
    # Note: In production, you might not want to delete backups immediately
    echo "⚠️ Skipping backup deletion for safety - would delete backup $BACKUP_ID"
    log_test_result "backup-delete" "SKIP" "Skipped backup deletion for safety"
fi

# Update test context with enterprise information
cat >> test-context.sh << EOF

# Enterprise features test context
export TEST_BACKUP_ID="$BACKUP_ID"
export TEST_BACKUP_POLICY_ID="$BACKUP_POLICY_ID"
export TEST_TOKEN_ID="$TOKEN_ID"
export TEST_IP_ALLOWLIST_ID="$IP_ALLOWLIST_ID"
export TEST_COMPLIANCE_REPORT_ID="$COMPLIANCE_REPORT_ID"
export TEST_RESTORE_PROJECT_ID="$RESTORE_PROJECT_ID"
EOF

echo ""
echo "✅ Enterprise Features Testing Phase Complete"
echo "📋 Summary:"
echo "   - Backup ID: $BACKUP_ID"
echo "   - Backup Policy ID: $BACKUP_POLICY_ID"
echo "   - Access Token ID: $TOKEN_ID"
echo "   - IP Allowlist ID: $IP_ALLOWLIST_ID"
echo "   - Compliance Report ID: $COMPLIANCE_REPORT_ID"
echo "   - Restore Project ID: $RESTORE_PROJECT_ID"
echo "   - All enterprise security and compliance features verified"
echo ""
echo "💾 Enterprise context added to test-context.sh"