#!/bin/bash
# Manual cURL testing for RPC endpoint

RPC_URL="http://localhost:8899"

echo "🧪 Testing RPC Endpoint with cURL..."
echo ""

# Function to test RPC method
test_rpc_method() {
    local method=$1
    local params=$2
    local description=$3
    
    echo "🔍 Testing: $description"
    echo "Method: $method"
    
    local payload="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$method\""
    if [ -n "$params" ]; then
        payload="${payload},\"params\":$params"
    fi
    payload="${payload}}"
    
    echo "Payload: $payload"
    
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$RPC_URL" \
        -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n\n"
    
    echo "----------------------------------------"
}

echo "📊 Testing Core RPC Methods:"
test_rpc_method "getHealth" "" "Health Check"
test_rpc_method "getVersion" "" "Version Information"
test_rpc_method "getSlot" "" "Current Slot"

echo "🌐 Testing Web3/Ethereum Methods:"
test_rpc_method "eth_blockNumber" "" "Ethereum Block Number"
test_rpc_method "eth_chainId" "" "Chain ID"

echo "🎉 cURL testing complete!"
