#!/usr/bin/env python3
"""
Quick script to initialize the first super admin user.
Run this after setting up the database and creating your first user.
"""

import requests
import sys

def initialize_super_admin(email: str, api_url: str = "http://localhost:8000"):
    """Initialize the first super admin user."""
    endpoint = f"{api_url}/api/super-admin/initialize-super-admin"
    
    print("\n" + "="*60)
    print("GreenScale - Super Admin Initialization")
    print("="*60 + "\n")
    
    print(f"Attempting to promote user: {email}")
    print(f"API Endpoint: {endpoint}\n")
    
    try:
        response = requests.post(
            endpoint,
            params={"email": email},
            timeout=10
        )
        
        data = response.json()
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {data}\n")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            print(f"   User: {data['user_id']}")
            print(f"   Email: {email}")
            print("   Status: Super Admin")
            print("\n   You can now:")
            print("   1. Log in at http://localhost:5173")
            print("   2. Navigate to Dashboard → Super Admin")
            print("   3. Manage users, roles, and permissions\n")
            return True
        else:
            print("❌ FAILED!")
            print(f"   Reason: {data.get('detail', 'Unknown error')}\n")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to backend")
        print(f"   Make sure the backend is running at {api_url}")
        print("   Run: python -m uvicorn main:app --host 0.0.0.0 --port 8000\n")
        return False
    except (ConnectionError, ValueError) as e:
        print(f"❌ ERROR: {str(e)}\n")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python setup_super_admin.py <user_email>")
        print("Example: python setup_super_admin.py admin@company.com")
        sys.exit(1)
    
    user_email = sys.argv[1]
    
    if "@" not in user_email:
        print("❌ Invalid email format!")
        sys.exit(1)
    
    success = initialize_super_admin(user_email)
    sys.exit(0 if success else 1)
