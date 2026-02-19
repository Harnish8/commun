#!/usr/bin/env python3
"""
Backend API Testing for CommuniShare App
Tests the payment logging and health check endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://communishare.preview.emergentagent.com/api"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                print("✅ Health check passed")
                return True
            else:
                print("❌ Health check failed - invalid response format")
                return False
        else:
            print(f"❌ Health check failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed - error: {str(e)}")
        return False

def test_create_payment():
    """Test creating a payment log"""
    print("\n🔍 Testing Create Payment Endpoint...")
    
    payment_data = {
        "user_id": "test_user_123",
        "user_email": "test@example.com", 
        "user_name": "Test User",
        "group_id": "group_1",
        "group_name": "Netflix Premium",
        "amount": "₹499/month",
        "payment_type": "subscription"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/payments",
            json=payment_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "user_id", "user_email", "user_name", "group_id", "group_name", "amount", "payment_type"]
            if all(field in data for field in required_fields):
                print("✅ Payment creation passed")
                return True, data["id"]
            else:
                print("❌ Payment creation failed - missing required fields")
                return False, None
        else:
            print(f"❌ Payment creation failed - status code {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Payment creation failed - error: {str(e)}")
        return False, None

def test_get_all_payments():
    """Test getting all payments"""
    print("\n🔍 Testing Get All Payments Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/payments", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of payments returned: {len(data)}")
            if isinstance(data, list):
                print("✅ Get all payments passed")
                return True
            else:
                print("❌ Get all payments failed - response is not a list")
                return False
        else:
            print(f"❌ Get all payments failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get all payments failed - error: {str(e)}")
        return False

def test_get_user_payments():
    """Test getting payments for a specific user"""
    print("\n🔍 Testing Get User Payments Endpoint...")
    user_id = "test_user_123"
    try:
        response = requests.get(f"{BACKEND_URL}/payments/user/{user_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of user payments returned: {len(data)}")
            if isinstance(data, list):
                # Check if all payments belong to the requested user
                if all(payment.get("user_id") == user_id for payment in data):
                    print("✅ Get user payments passed")
                    return True
                else:
                    print("❌ Get user payments failed - some payments don't belong to the user")
                    return False
            else:
                print("❌ Get user payments failed - response is not a list")
                return False
        else:
            print(f"❌ Get user payments failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get user payments failed - error: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting CommuniShare Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Health Check
    results["health_check"] = test_health_check()
    
    # Test 2: Create Payment
    results["create_payment"], payment_id = test_create_payment()
    
    # Test 3: Get All Payments
    results["get_all_payments"] = test_get_all_payments()
    
    # Test 4: Get User Payments
    results["get_user_payments"] = test_get_user_payments()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())