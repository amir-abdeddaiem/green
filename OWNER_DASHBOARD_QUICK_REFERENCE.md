# Owner Dashboard Security - Quick Reference

## 🔒 What is Protected?
- **Owner Dashboard** (`/admin-dashboard/*`) - RESTRICTED TO SUPER ADMIN ONLY
- **User Management** - Create, edit, delete users - SUPER ADMIN ONLY
- **System Settings** - Configure system - SUPER ADMIN ONLY

## ✅ Access Control Checklist

### For Owner (Super Admin)
- ✅ Can access Owner Dashboard
- ✅ Can view all users
- ✅ Can create new users
- ✅ Can assign roles to users
- ✅ Can delete users
- ✅ Can access system settings
- ✅ See "Owner Dashboard" link in profile menu

### For Regular Users
- ❌ Cannot access Owner Dashboard
- ❌ Cannot create users
- ❌ Cannot manage other users
- ❌ Cannot access admin settings
- ❌ Don't see "Owner Dashboard" link
- ✅ Can access regular dashboard
- ✅ Can track emissions
- ✅ Can view analytics

## 🛡️ Security Layers

### Layer 1: Frontend Authentication
- **Check**: Token exists in localStorage
- **Location**: `ProtectedAdminRoute.tsx`
- **Redirect on Fail**: → /login

### Layer 2: Frontend Authorization
- **Check**: `is_super_admin === "true"` in localStorage
- **Location**: `ProtectedAdminRoute.tsx`, `DashboardLayout.tsx`
- **Redirect on Fail**: → /dashboard

### Layer 3: Backend Authorization
- **Check**: User has `is_super_admin = true` in database
- **Location**: `super_admin_routes.py`
- **Response on Fail**: 403 Forbidden

### Layer 4: Session Validation
- **Check**: User ID must exist and match authenticated user
- **Location**: `ProtectedAdminRoute.tsx`, `SuperAdminLayout.tsx`
- **Action on Fail**: Clear session, redirect to login

## 📋 Files Involved

### Frontend
```
src/
├── components/
│   └── ProtectedAdminRoute.tsx ........... Auth wrapper
├── features/dashboard/
│   ├── components/
│   │   ├── DashboardLayout.tsx ........... Regular dashboard
│   │   ├── SuperAdminLayout.tsx ......... Owner dashboard
│   │   ├── UserManagementTab.tsx ........ User CRUD
│   │   ├── pages/
│   │   │   ├── AdminUsersPage.tsx ....... Admin users page
│   │   │   └── AdminSettingsPage.tsx .... Admin settings
└── App.tsx ............................. Routes config
```

### Backend
```
Verdustry-backend/
├── super_admin_routes.py ............... Admin endpoints
├── role_utils.py ...................... is_super_admin() check
└── main.py ............................ App config
```

## 🔑 Key Functions

### Frontend
```typescript
// Check if user is super admin
const isSuperAdmin = localStorage.getItem("is_super_admin") === "true";

// Verify authentication
const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
```

### Backend
```python
# Verify super admin status
def verify_super_admin(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not is_super_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Super admin required")
```

## 🚀 API Endpoints

### Admin Endpoints (Super Admin Only)
```
POST   /api/super-admin/create-user ........... Create new user
GET    /api/super-admin/users ................ List all users
POST   /api/super-admin/users/{id}/roles .... Assign roles
DELETE /api/super-admin/users/{id} .......... Delete user
POST   /api/super-admin/users/{id}/promote .. Promote to super admin
POST   /api/super-admin/users/{id}/demote ... Demote from super admin
GET    /api/super-admin/dashboard/stats ..... Dashboard statistics
```

### Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Email already exists

## 📊 User Creation Flow

```
User clicks "Add New User"
         ↓
Modal form appears
         ↓
Super admin fills form (Name, Email, Password, Role)
         ↓
Frontend validates input
         ↓
API call: POST /api/super-admin/create-user
         ↓
Backend checks: is_super_admin? (403 if not)
         ↓
Backend checks: Email unique? (409 if duplicate)
         ↓
Create user + assign roles
         ↓
Log: "User created by super admin [email]"
         ↓
Response: Success message
         ↓
User appears in list
```

## 🚨 Security Events Logged

```
✅ Owner Dashboard access granted for user [id]
❌ Access Denied: User is not super admin
❌ Access Denied: No authentication token
🚨 SECURITY: Unauthorized access attempt to /admin-dashboard
❌ Access Denied: User ID not found
```

View logs in: Browser Console (F12)

## 🔐 Logout Security

When user clicks Logout:
```javascript
localStorage.removeItem("token");         // Clear token
localStorage.removeItem("is_super_admin"); // Clear super admin flag
localStorage.removeItem("user_id");       // Clear user ID
navigate("/login");                       // Redirect to login
```

Result: Session completely cleared

## ⚠️ Important Notes

1. **Single Owner**: Only ONE person should have `is_super_admin = true`
2. **Cannot Self-Delete**: Super admin cannot delete their own account
3. **Cannot Self-Demote**: Super admin cannot remove their own super admin status
4. **Email Unique**: Each user must have unique email address
5. **Password Required**: All users must have strong password

## 🔧 Troubleshooting

### Problem: "Owner Dashboard" link not visible
**Solution**: Verify `localStorage.getItem("is_super_admin") === "true"`

### Problem: 403 Forbidden when creating user
**Solution**: Logged-in user is not super admin. Contact owner.

### Problem: Redirected to login when accessing admin dashboard
**Solution**: Token expired or missing. Log in again.

### Problem: Can see admin dashboard but can't create users
**Solution**: User role doesn't have "user_create" permission. Assign role.

## 📞 Support

For security issues or access problems:
1. Check browser console (F12) for error messages
2. Verify authentication status: `localStorage.getItem("token")`
3. Verify super admin status: `localStorage.getItem("is_super_admin")`
4. Contact system administrator

---

**Last Updated**: January 2024
**Status**: ✅ Production Ready
**Access Level**: HIGH SECURITY
