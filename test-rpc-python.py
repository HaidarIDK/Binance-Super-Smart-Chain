#!/usr/bin/env python3
# Python RPC Testing Script

import requests
import json
import time

RPC_URL = "http://localhost:8899"

def test_rpc_method(method, params=None, description=""):
    """Test a single RPC method"""
    print(f"🔍 Testing: {description}")
    print(f"Method: {method}")
    
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method
    }
    
    if params is not None:
        payload["params"] = params
    
    try:
        response = requests.post(
            RPC_URL,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(result, indent=2)}")
            print("")
            return result
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            print("")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
        print("")
        return None

def main():
    """Run all RPC tests"""
    print("🧪 Testing RPC Endpoint with Python...\n")
    
    # Test core RPC methods
    print("📊 Testing Core RPC Methods:")
    test_rpc_method("getHealth", description="Health Check")
    test_rpc_method("getVersion", description="Version Information")
    test_rpc_method("getSlot", description="Current Slot")
    test_rpc_method("getBlockHeight", description="Block Height")
    
    # Test Web3/Ethereum methods
    print("🌐 Testing Web3/Ethereum Methods:")
    test_rpc_method("eth_blockNumber", description="Ethereum Block Number")
    test_rpc_method("eth_chainId", description="Chain ID")
    test_rpc_method("net_version", description="Network Version")
    
    # Test account methods
    print("📝 Testing Account Methods:")
    test_rpc_method("getAccountInfo", ["11111111111111111111111111111111"], "Account Info")
    
    print("🎉 Python testing complete!")

if __name__ == "__main__":
    main()
