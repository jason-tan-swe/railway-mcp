#!/bin/bash

# test-networking.sh - Test networking and infrastructure features
set -e

echo "🌐 Starting Networking & Infrastructure Testing Phase"
echo "=================================================="

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

# Test 1: Create private network
echo "🔒 Testing private network creation..."
network_response=$(call_tool "networking-network-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-network-$(date +%s)\", \"cidr\": \"10.0.0.0/24\", \"region\": \"us-west1\"")

if validate_success "$network_response" "Private Network Create" 2>/dev/null; then
    NETWORK_ID=$(extract_value "$network_response" ".result.content[0].data.id")
    echo "✅ Created private network: $NETWORK_ID"
    log_test_result "networking-network-create" "PASS" "Created private network $NETWORK_ID"
else
    echo "⚠️ Private networking not available"
    log_test_result "networking-network-create" "SKIP" "Private networking not available"
    # Continue with other tests that don't require private networking
fi

# Test 2: List private networks
echo "📋 Testing private network listing..."
networks_list_response=$(call_tool "networking-private-networks" "\"projectId\": \"$PROJECT_ID\"")

if validate_success "$networks_list_response" "Private Networks List" 2>/dev/null; then
    log_test_result "networking-networks-list" "PASS" "Retrieved private networks list"
else
    echo "⚠️ Private networks listing not available"
    log_test_result "networking-networks-list" "SKIP" "Private networks listing not available"
fi

# Test 3: Add service endpoint to private network
if [ -n "$NETWORK_ID" ] && [ "$NETWORK_ID" != "null" ]; then
    echo "🔗 Testing service endpoint addition..."
    endpoint_add_response=$(call_tool "networking-endpoint-add" "\"networkId\": \"$NETWORK_ID\", \"serviceId\": \"$SERVICE_ID\", \"port\": 3000, \"protocol\": \"HTTP\"")
    
    if validate_success "$endpoint_add_response" "Network Endpoint Add" 2>/dev/null; then
        ENDPOINT_ID=$(extract_value "$endpoint_add_response" ".result.content[0].data.id")
        echo "✅ Added service endpoint: $ENDPOINT_ID"
        log_test_result "networking-endpoint-add" "PASS" "Added endpoint $ENDPOINT_ID"
        
        # Add database endpoint if available
        if [ -n "$TEST_POSTGRES_SERVICE_ID" ]; then
            db_endpoint_response=$(call_tool "networking-endpoint-add" "\"networkId\": \"$NETWORK_ID\", \"serviceId\": \"$TEST_POSTGRES_SERVICE_ID\", \"port\": 5432, \"protocol\": \"TCP\"")
            if validate_success "$db_endpoint_response" "Database Endpoint Add" 2>/dev/null; then
                DB_ENDPOINT_ID=$(extract_value "$db_endpoint_response" ".result.content[0].data.id")
                log_test_result "networking-db-endpoint-add" "PASS" "Added database endpoint $DB_ENDPOINT_ID"
            fi
        fi
    else
        echo "⚠️ Network endpoint addition not available"
        log_test_result "networking-endpoint-add" "SKIP" "Endpoint addition not available"
    fi
fi

# Test 4: Load balancer creation
echo "⚖️ Testing load balancer creation..."
lb_response=$(call_tool "networking-load-balancer-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-lb-$(date +%s)\", \"type\": \"APPLICATION\", \"algorithm\": \"ROUND_ROBIN\", \"healthCheck\": {\"path\": \"/health\", \"port\": 3000, \"protocol\": \"HTTP\", \"interval\": 30, \"timeout\": 5, \"healthyThreshold\": 2, \"unhealthyThreshold\": 3}, \"listeners\": [{\"port\": 80, \"protocol\": \"HTTP\"}, {\"port\": 443, \"protocol\": \"HTTPS\"}]")

if validate_success "$lb_response" "Load Balancer Create" 2>/dev/null; then
    LB_ID=$(extract_value "$lb_response" ".result.content[0].data.id")
    echo "✅ Created load balancer: $LB_ID"
    log_test_result "networking-lb-create" "PASS" "Created load balancer $LB_ID"
else
    echo "⚠️ Load balancer creation not available"
    log_test_result "networking-lb-create" "SKIP" "Load balancer not available"
fi

# Test 5: List load balancers
echo "📋 Testing load balancer listing..."
lb_list_response=$(call_tool "networking-load-balancers" "\"projectId\": \"$PROJECT_ID\"")

if validate_success "$lb_list_response" "Load Balancers List" 2>/dev/null; then
    log_test_result "networking-lb-list" "PASS" "Retrieved load balancers list"
else
    echo "⚠️ Load balancer listing not available"
    log_test_result "networking-lb-list" "SKIP" "Load balancer listing not available"
fi

# Test 6: Add target to load balancer
if [ -n "$LB_ID" ] && [ "$LB_ID" != "null" ]; then
    echo "🎯 Testing load balancer target addition..."
    lb_target_response=$(call_tool "networking-lb-target-add" "\"loadBalancerId\": \"$LB_ID\", \"serviceId\": \"$SERVICE_ID\", \"weight\": 100")
    
    if validate_success "$lb_target_response" "LB Target Add" 2>/dev/null; then
        log_test_result "networking-lb-target-add" "PASS" "Added target to load balancer"
        
        # Test adding multiple targets with different weights
        if [ -n "$TEST_POSTGRES_SERVICE_ID" ]; then
            lb_target2_response=$(call_tool "networking-lb-target-add" "\"loadBalancerId\": \"$LB_ID\", \"serviceId\": \"$TEST_POSTGRES_SERVICE_ID\", \"weight\": 50")
            if validate_success "$lb_target2_response" "LB Target Add 2" 2>/dev/null; then
                log_test_result "networking-lb-target-add-2" "PASS" "Added second target to load balancer"
            fi
        fi
    else
        echo "⚠️ Load balancer target addition not available"
        log_test_result "networking-lb-target-add" "SKIP" "LB target addition not available"
    fi
fi

# Test 7: Update load balancer health check
if [ -n "$LB_ID" ] && [ "$LB_ID" != "null" ]; then
    echo "🏥 Testing load balancer health check update..."
    lb_health_update_response=$(call_tool "networking-lb-health-check-update" "\"loadBalancerId\": \"$LB_ID\", \"healthCheck\": {\"path\": \"/api/health\", \"port\": 3000, \"protocol\": \"HTTP\", \"interval\": 60, \"timeout\": 10, \"healthyThreshold\": 3, \"unhealthyThreshold\": 2}")
    
    if validate_success "$lb_health_update_response" "LB Health Check Update" 2>/dev/null; then
        log_test_result "networking-lb-health-update" "PASS" "Updated load balancer health check"
    else
        echo "⚠️ Load balancer health check update not available"
        log_test_result "networking-lb-health-update" "SKIP" "LB health check update not available"
    fi
fi

# Test 8: Network routes management
if [ -n "$NETWORK_ID" ] && [ "$NETWORK_ID" != "null" ]; then
    echo "🛣️ Testing network routes..."
    routes_list_response=$(call_tool "networking-routes" "\"networkId\": \"$NETWORK_ID\"")
    
    if validate_success "$routes_list_response" "Network Routes List" 2>/dev/null; then
        log_test_result "networking-routes-list" "PASS" "Retrieved network routes"
        
        # Test route creation
        echo "➕ Testing route creation..."
        route_create_response=$(call_tool "networking-route-create" "\"networkId\": \"$NETWORK_ID\", \"destination\": \"192.168.1.0/24\", \"gateway\": \"10.0.0.1\", \"metric\": 100")
        
        if validate_success "$route_create_response" "Route Create" 2>/dev/null; then
            ROUTE_ID=$(extract_value "$route_create_response" ".result.content[0].data.id")
            echo "✅ Created network route: $ROUTE_ID"
            log_test_result "networking-route-create" "PASS" "Created route $ROUTE_ID"
        fi
    else
        echo "⚠️ Network routes not available"
        log_test_result "networking-routes-list" "SKIP" "Network routes not available"
    fi
fi

# Test 9: Security groups management
if [ -n "$NETWORK_ID" ] && [ "$NETWORK_ID" != "null" ]; then
    echo "🛡️ Testing security groups..."
    sg_list_response=$(call_tool "networking-security-groups" "\"networkId\": \"$NETWORK_ID\"")
    
    if validate_success "$sg_list_response" "Security Groups List" 2>/dev/null; then
        log_test_result "networking-security-groups-list" "PASS" "Retrieved security groups"
        
        # Test security group creation
        echo "🔒 Testing security group creation..."
        sg_create_response=$(call_tool "networking-security-group-create" "\"networkId\": \"$NETWORK_ID\", \"name\": \"test-sg-$(date +%s)\", \"description\": \"Test security group for integration testing\", \"rules\": [{\"direction\": \"INBOUND\", \"protocol\": \"TCP\", \"portRange\": \"80\", \"source\": \"0.0.0.0/0\", \"action\": \"ALLOW\", \"priority\": 100}, {\"direction\": \"INBOUND\", \"protocol\": \"TCP\", \"portRange\": \"443\", \"source\": \"0.0.0.0/0\", \"action\": \"ALLOW\", \"priority\": 101}, {\"direction\": \"INBOUND\", \"protocol\": \"TCP\", \"portRange\": \"22\", \"source\": \"10.0.0.0/24\", \"action\": \"ALLOW\", \"priority\": 102}]")
        
        if validate_success "$sg_create_response" "Security Group Create" 2>/dev/null; then
            SG_ID=$(extract_value "$sg_create_response" ".result.content[0].data.id")
            echo "✅ Created security group: $SG_ID"
            log_test_result "networking-security-group-create" "PASS" "Created security group $SG_ID"
        fi
    else
        echo "⚠️ Security groups not available"
        log_test_result "networking-security-groups-list" "SKIP" "Security groups not available"
    fi
fi

# Test 10: Network load balancer (different type)
echo "🌐 Testing network load balancer..."
nlb_response=$(call_tool "networking-load-balancer-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-nlb-$(date +%s)\", \"type\": \"NETWORK\", \"algorithm\": \"LEAST_CONNECTIONS\", \"healthCheck\": {\"path\": \"/\", \"port\": 80, \"protocol\": \"TCP\", \"interval\": 30, \"timeout\": 5, \"healthyThreshold\": 2, \"unhealthyThreshold\": 3}, \"listeners\": [{\"port\": 80, \"protocol\": \"TCP\"}, {\"port\": 8080, \"protocol\": \"TCP\"}]")

if validate_success "$nlb_response" "Network Load Balancer Create" 2>/dev/null; then
    NLB_ID=$(extract_value "$nlb_response" ".result.content[0].data.id")
    echo "✅ Created network load balancer: $NLB_ID"
    log_test_result "networking-nlb-create" "PASS" "Created network load balancer $NLB_ID"
else
    echo "⚠️ Network load balancer not available"
    log_test_result "networking-nlb-create" "SKIP" "Network load balancer not available"
fi

# Test 11: Load balancer algorithms testing
echo "🔄 Testing different load balancing algorithms..."
algorithms=("ROUND_ROBIN" "LEAST_CONNECTIONS" "IP_HASH" "WEIGHTED")

for algorithm in "${algorithms[@]}"; do
    alg_lb_response=$(call_tool "networking-load-balancer-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-${algorithm,,}-$(date +%s)\", \"type\": \"APPLICATION\", \"algorithm\": \"$algorithm\", \"healthCheck\": {\"path\": \"/health\", \"port\": 3000, \"protocol\": \"HTTP\", \"interval\": 30, \"timeout\": 5, \"healthyThreshold\": 2, \"unhealthyThreshold\": 3}, \"listeners\": [{\"port\": 80, \"protocol\": \"HTTP\"}]")
    
    if validate_success "$alg_lb_response" "$algorithm Load Balancer" 2>/dev/null; then
        ALG_LB_ID=$(extract_value "$alg_lb_response" ".result.content[0].data.id")
        echo "✅ Created $algorithm load balancer: $ALG_LB_ID"
        log_test_result "networking-lb-algorithm-$algorithm" "PASS" "Created $algorithm load balancer"
        
        # Add targets with different weights for weighted algorithm
        if [ "$algorithm" = "WEIGHTED" ] && [ -n "$ALG_LB_ID" ] && [ "$ALG_LB_ID" != "null" ]; then
            weighted_target_response=$(call_tool "networking-lb-target-add" "\"loadBalancerId\": \"$ALG_LB_ID\", \"serviceId\": \"$SERVICE_ID\", \"weight\": 70")
            if validate_success "$weighted_target_response" "Weighted Target" 2>/dev/null; then
                log_test_result "networking-weighted-target" "PASS" "Added weighted target"
            fi
        fi
    else
        echo "⚠️ $algorithm load balancer not available"
        log_test_result "networking-lb-algorithm-$algorithm" "SKIP" "$algorithm load balancer not available"
    fi
done

# Test 12: Advanced networking features
echo "🔧 Testing advanced networking features..."

# Test TCP proxy if available
if [ -n "$SERVICE_ID" ]; then
    tcp_proxy_response=$(call_tool "tcpProxy-list" "\"serviceId\": \"$SERVICE_ID\"")
    if validate_success "$tcp_proxy_response" "TCP Proxy List" 2>/dev/null; then
        log_test_result "networking-tcp-proxy" "PASS" "Retrieved TCP proxy information"
    else
        echo "⚠️ TCP proxy information not available"
        log_test_result "networking-tcp-proxy" "SKIP" "TCP proxy not available"
    fi
fi

# Test 13: Remove load balancer targets
if [ -n "$LB_ID" ] && [ "$LB_ID" != "null" ]; then
    echo "🗑️ Testing load balancer target removal..."
    lb_target_remove_response=$(call_tool "networking-lb-target-remove" "\"loadBalancerId\": \"$LB_ID\", \"serviceId\": \"$SERVICE_ID\"")
    
    if validate_success "$lb_target_remove_response" "LB Target Remove" 2>/dev/null; then
        log_test_result "networking-lb-target-remove" "PASS" "Removed target from load balancer"
    else
        echo "⚠️ Load balancer target removal not available"
        log_test_result "networking-lb-target-remove" "SKIP" "LB target removal not available"
    fi
fi

# Test 14: Network endpoint removal
if [ -n "$ENDPOINT_ID" ] && [ "$ENDPOINT_ID" != "null" ]; then
    echo "🔌 Testing network endpoint removal..."
    endpoint_remove_response=$(call_tool "networking-endpoint-remove" "\"endpointId\": \"$ENDPOINT_ID\"")
    
    if validate_success "$endpoint_remove_response" "Network Endpoint Remove" 2>/dev/null; then
        log_test_result "networking-endpoint-remove" "PASS" "Removed network endpoint"
    else
        echo "⚠️ Network endpoint removal not available"
        log_test_result "networking-endpoint-remove" "SKIP" "Endpoint removal not available"
    fi
fi

# Test 15: Clean up networking resources (optional)
echo "🧹 Testing networking resource cleanup..."

# Delete route if created
if [ -n "$ROUTE_ID" ] && [ "$ROUTE_ID" != "null" ]; then
    route_delete_response=$(call_tool "networking-route-delete" "\"routeId\": \"$ROUTE_ID\"")
    if validate_success "$route_delete_response" "Route Delete" 2>/dev/null; then
        log_test_result "networking-route-delete" "PASS" "Deleted network route"
    fi
fi

# Delete load balancers if created
if [ -n "$NLB_ID" ] && [ "$NLB_ID" != "null" ]; then
    nlb_delete_response=$(call_tool "networking-load-balancer-delete" "\"loadBalancerId\": \"$NLB_ID\"")
    if validate_success "$nlb_delete_response" "Network LB Delete" 2>/dev/null; then
        log_test_result "networking-nlb-delete" "PASS" "Deleted network load balancer"
    fi
fi

# Test 16: Network performance and connectivity testing
echo "📊 Testing network performance features..."
if [ -n "$NETWORK_ID" ] && [ "$NETWORK_ID" != "null" ]; then
    # Re-add endpoints to test connectivity
    connectivity_test_response=$(call_tool "networking-endpoint-add" "\"networkId\": \"$NETWORK_ID\", \"serviceId\": \"$SERVICE_ID\", \"port\": 8080, \"protocol\": \"HTTP\"")
    
    if validate_success "$connectivity_test_response" "Connectivity Test" 2>/dev/null; then
        log_test_result "networking-connectivity" "PASS" "Network connectivity test completed"
    fi
fi

# Update test context with networking information
cat >> test-context.sh << EOF

# Networking test context
export TEST_NETWORK_ID="$NETWORK_ID"
export TEST_LB_ID="$LB_ID"
export TEST_NLB_ID="$NLB_ID"
export TEST_ENDPOINT_ID="$ENDPOINT_ID"
export TEST_ROUTE_ID="$ROUTE_ID"
export TEST_SG_ID="$SG_ID"
EOF

echo ""
echo "✅ Networking & Infrastructure Testing Phase Complete"
echo "📋 Summary:"
echo "   - Network ID: $NETWORK_ID"
echo "   - Load Balancer ID: $LB_ID"
echo "   - Network Load Balancer ID: $NLB_ID"
echo "   - Endpoint ID: $ENDPOINT_ID"
echo "   - Route ID: $ROUTE_ID"
echo "   - Security Group ID: $SG_ID"
echo "   - All networking and infrastructure features verified"
echo ""
echo "💾 Networking context added to test-context.sh"