# Owner Dashboard Security Testing Guide

## Quick Start - Testing Access Control

### Prerequisites
1. Backend running on port 8000
2. Frontend running on port 5173
3. Test user accounts with different roles

---

## Test Scenarios

### Scenario 1: Super Admin Access ✅
**Objective**: Verify that super admin can access owner dashboard

**Steps**:
1. Login with super admin credentials
   - Email: [super_admin_email]
   - Password: [super_admin_password]

2. Verify "Owner Dashboard" link appears in profile dropdown
   - Click profile icon (top-right)
   - Should see "👑 Owner Dashboard" option

3. Click "Owner Dashboard"
   - Should navigate to `/admin-dashboard`
   - Should see SuperAdminLayout with green gradient sidebar
   - Should see security banner: "🔒 Restricted Access"

4. Verify admin features work:
   - Dashboard overview displays
   - Can access User Management tab
   - Can access Settings tab
   - Can create new users

**Expected Result**: ✅ All features accessible without restrictions

---

### Scenario 2: Regular User Restriction ❌
**Objective**: Verify that regular users cannot access owner dashboard

**Steps**:
1. Login with regular user credentials
   - Email: [regular_user_email]
   - Password: [regular_user_password]

2. Verify "Owner Dashboard" link does NOT appear
   - Click profile icon (top-right)
   - Should NOT see "👑 Owner Dashboard" option
   - Only see: Settings, Support, Logout

3. Try accessing `/admin-dashboard` directly in URL
   - Should be redirected to `/dashboard`
   - No error message shown
   - Regular dashboard should load

4. Try accessing `/admin-dashboard/users` directly
   - Should be redirected to `/dashboard`
   - Protected route should prevent access

**Expected Result**: ✅ Regular users blocked from admin dashboard

---

### Scenario 3: Unauthenticated Access ❌
**Objective**: Verify that non-logged-in users are redirected to login

**Steps**:
1. Logout (if currently logged in)
   - Click profile → Logout
   - localStorage should be cleared

2. Try accessing `/admin-dashboard` in URL
   - Should redirect to `/login`
   - Login form should display

3. Try accessing `/admin-dashboard/users` in URL
   - Should redirect to `/login`
   - No partial content should load

**Expected Result**: ✅ Unauthenticated users redirected to login

---

### Scenario 4: Super Admin User Creation ✅
**Objective**: Verify only super admin can create users

**Steps**:
1. Login as super admin

2. Navigate to Owner Dashboard → User Management

3. Click "Add New User" button
   - Modal form should appear
   - Fields: Full Name, Email, Password, Password Confirmation, Role Selection

4. Fill in user creation form:
   - Full Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123
   - Confirm Password: TestPass123
   - Select a role (e.g., "Staff")

5. Click "Create User"
   - Form should submit
   - Success message should appear: "User created successfully"
   - Alert auto-dismisses after 5 seconds
   - New user appears in the user list table

6. Verify new user details in list:
   - Name appears in table
   - Email appears in table
   - Assigned role displays
   - Created date shows

**Expected Result**: ✅ Super admin successfully creates user

---

### Scenario 5: Unauthorized User Creation Attempt ❌
**Objective**: Verify that regular users cannot create users via API

**Steps**:
1. Login as regular user

2. Open browser Developer Tools (F12) → Console

3. Try to manually call the user creation API:
   ```javascript
   fetch('/api/super-admin/create-user', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       business_name: 'Test',
       email: 'test@example.com',
       password: 'Test123',
       role_ids: []
     })
   }).then(r => r.json()).then(console.log)
   ```

4. Check response:
   - Should receive 403 Forbidden
   - Message: "Super admin access required"
   - User should NOT be created

**Expected Result**: ✅ API rejects unauthorized user creation request

---

### Scenario 6: Session Persistence 🔄
**Objective**: Verify owner dashboard access persists across page refresh

**Steps**:
1. Login as super admin

2. Navigate to Owner Dashboard

3. Refresh page (F5 or Ctrl+R)
   - Should remain on Owner Dashboard
   - No redirect to login
   - All data should reload

4. Close and reopen browser tab
   - If token still in localStorage: should access dashboard
   - If localStorage cleared: should redirect to login

**Expected Result**: ✅ Session persists with valid token

---

### Scenario 7: Logout Security 🔐
**Objective**: Verify logout clears all authentication data

**Steps**:
1. Login as super admin

2. Navigate to Owner Dashboard

3. Click profile → Logout
   - Should redirect to login page
   - localStorage should be cleared

4. Try accessing `/admin-dashboard` in URL
   - Should redirect to `/login`
   - No authentication tokens should remain

5. Check browser DevTools → Storage → localStorage
   - Should be empty (no "token", "is_super_admin", etc.)

**Expected Result**: ✅ Logout properly clears all sessions

---

## Browser Console Logging Tests

### Expected Security Logs When Accessing Admin Dashboard

**On successful super admin access:**
```
✅ Owner Dashboard access granted for user 1 to /admin-dashboard
✅ Owner Dashboard access granted for user 1 to /admin-dashboard/users
```

**On unauthorized access attempt:**
```
🚨 SECURITY: Unauthorized access attempt to /admin-dashboard {
  hasToken: true,
  isSuperAdmin: false,
  timestamp: "2024-01-20T10:30:00Z"
}
❌ Access Denied: User is not super admin
```

**On missing token:**
```
❌ Access Denied: No authentication token found
```

---

## Network Request Validation

### Check Network Tab (DevTools → Network)

1. **On Login Request**
   - Verify response contains `is_super_admin` flag
   - For super admin: `"is_super_admin": true`
   - For regular user: `"is_super_admin": false`

2. **On User Creation Request**
   - Endpoint: `POST /api/super-admin/create-user`
   - Headers: Should include authorization
   - Request body should contain: business_name, email, password, role_ids
   - Response should return: success, user_id, message, created_by

3. **On Failed User Creation**
   - Status code: 403 Forbidden
   - Response: `{"detail": "Super admin access required"}`

---

## Database Validation Tests

### Verify Super Admin Status in Database

```sql
-- Check user is marked as super admin
SELECT id, email, is_super_admin FROM users WHERE email = 'owner@example.com';

-- Should return:
-- id | email                | is_super_admin
-- 1  | owner@example.com    | true
```

### Verify User Creation

```sql
-- Check newly created user exists
SELECT id, business_name, email, created_at FROM users WHERE email = 'testuser@example.com';

-- Verify user has assigned roles
SELECT u.id, u.email, r.name FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'testuser@example.com';
```

---

## Automated Test Cases

### Unit Test Example (Frontend)
```typescript
// Test: ProtectedAdminRoute prevents unauthorized access
describe('ProtectedAdminRoute', () => {
  it('should redirect non-super-admin users', () => {
    localStorage.setItem('is_super_admin', 'false');
    render(<ProtectedAdminRoute><div>Admin Content</div></ProtectedAdminRoute>);
    
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should render children for super admin', () => {
    localStorage.setItem('is_super_admin', 'true');
    localStorage.setItem('token', 'valid-token');
    render(<ProtectedAdminRoute><div>Admin Content</div></ProtectedAdminRoute>);
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
```

### API Test Example (Backend)
```python
# Test: create-user endpoint requires super admin
def test_create_user_requires_super_admin():
    # As regular user
    response = client.post(
        "/api/super-admin/create-user",
        json={"email": "new@test.com", "password": "test123", "business_name": "Test"},
        headers={"user_id": "2"}  # Non-super-admin user ID
    )
    
    assert response.status_code == 403
    assert "Super admin" in response.json()["detail"]
```

---

## Performance & Load Testing

### Test Owner Dashboard Under Load
1. Open 10 browser tabs
2. Navigate to owner dashboard in each
3. All should authenticate properly
4. No session conflicts
5. Check for memory leaks

### Test User Creation Performance
1. Create 100 users sequentially
2. Measure average creation time
3. Verify database integrity
4. Check for orphaned records

---

## Security Checklist

- [ ] Super admin can access owner dashboard
- [ ] Regular users cannot access owner dashboard
- [ ] Unauthenticated users redirected to login
- [ ] "Owner Dashboard" link only shows for super admin
- [ ] User creation requires super admin authentication
- [ ] Logout clears all authentication data
- [ ] Session persists across page refresh
- [ ] Protected routes prevent direct URL access
- [ ] All admin operations logged in console
- [ ] API returns correct HTTP status codes
- [ ] Database reflects all changes correctly
- [ ] No sensitive data in localStorage (except needed flags)
- [ ] CORS allows only authorized requests
- [ ] Error messages don't reveal sensitive info

---

## Issue Reporting Template

When reporting a security issue, include:

```
### Security Issue Report

**Issue**: [Brief description]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happens]

**Screenshots**: 
[If applicable]

**Logs**: 
[Browser console output]

**Environment**:
- OS: Windows / Mac / Linux
- Browser: Chrome / Firefox / Safari / Edge
- Frontend URL: http://localhost:5173
- Backend URL: http://localhost:8000
```

---

## Support Contacts

For security testing assistance:
- Backend Developer: [email]
- Frontend Developer: [email]
- Security Team: [email]

---

## Conclusion

All owner dashboard security tests should pass without exceptions. If any test fails, document the issue and report it immediately.

**Last Updated**: January 2024
**Security Level**: HIGH
**Access Required**: Super Admin (Owner) Only
