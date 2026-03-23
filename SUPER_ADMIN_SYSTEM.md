# Super Admin System Documentation

## Overview

The Verdustry platform now includes a comprehensive **Super Admin System** that enables complete platform administration and user management. Super admins have the highest level of access and can manage all users, roles, permissions, and system configuration.

---

## Features

### 1. **Super Admin Role & Permissions**
- **Super Admin Role**: A dedicated role with complete access to all system permissions
- **Is Super Admin Flag**: A boolean field on the User model to designate super admin status
- **Dual Protection**: Users are protected by both the `is_super_admin` flag and the "Super Admin" role assignment

### 2. **User Management**
- View all platform users
- Promote regular users to super admin status
- Demote super admin users
- Delete users from the system
- View user roles and permissions

### 3. **Dashboard Statistics**
- Total users count
- Total super admins count
- Total roles count
- Total permissions count
- Real-time system metrics

### 4. **Role Management**
- View all system roles with user counts
- View role permissions
- Create new roles with custom permissions
- Assign/remove roles from users

### 5. **Permission Management**
- View all system permissions organized by category
- Permissions categories: emissions, reports, goals, analytics, settings, users, dashboard
- Assign permissions to roles

---

## Database Schema

### User Model Changes
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_super_admin = Column(Boolean, default=False, nullable=False)  # NEW
    created_at = Column(DateTime, default=datetime.utcnow)           # NEW
    
    # Relationships
    emissions = relationship("Emission", back_populates="owner")
    roles = relationship("Role", secondary="user_roles", back_populates="users")
```

### Migration
The `migrate_super_admin.py` script adds the following columns to the `users` table:
- `is_super_admin` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/super-admin
```

### Endpoints

#### 1. Dashboard Statistics
```
GET /dashboard/stats
```
Returns: SuperAdminDashboardStats
```json
{
  "total_users": 10,
  "total_super_admins": 2,
  "total_roles": 6,
  "total_permissions": 25
}
```

#### 2. Get All Super Admins
```
GET /users/super-admins
```
Returns: List[SuperAdminUserResponse]
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "business_name": "Admin Business",
    "is_super_admin": true,
    "roles": ["Super Admin"],
    "permissions": [...],
    "created_at": "2026-01-24T10:30:00"
  }
]
```

#### 3. Check User Super Admin Status
```
GET /users/{user_id}/is-super-admin
```
Returns: {user_id, email, is_super_admin, roles}

#### 4. Promote User to Super Admin
```
POST /users/{user_id}/promote
```
Body:
```json
{
  "requester_id": 1
}
```
Returns:
```json
{
  "success": true,
  "message": "User promoted to super admin",
  "user_id": 5,
  "is_super_admin": true
}
```

#### 5. Demote User from Super Admin
```
POST /users/{user_id}/demote
```
Body:
```json
{
  "requester_id": 1
}
```
Note: Cannot demote yourself

#### 6. Get All Users (Super Admin View)
```
GET /users
```
Returns: List[SuperAdminUserResponse]

#### 7. Delete User
```
DELETE /users/{user_id}
```
Body:
```json
{
  "requester_id": 1
}
```
Note: Cannot delete yourself

#### 8. Initialize First Super Admin
```
POST /initialize-super-admin
```
Body:
```json
{
  "email": "user@example.com"
}
```
Note: Can only be used if no super admins exist yet

---

## Backend Implementation

### Super Admin Utilities (`role_utils.py`)

#### Functions

```python
def is_super_admin(db: Session, user_id: int) -> bool
    """Check if a user is a super admin."""

def get_super_admin_users(db: Session) -> List[User]
    """Get all super admin users."""

def promote_to_super_admin(db: Session, user_id: int) -> bool
    """Promote a user to super admin status."""

def demote_from_super_admin(db: Session, user_id: int) -> bool
    """Demote a user from super admin status."""

def assign_super_admin_role(db: Session, user_id: int) -> bool
    """Assign Super Admin role to a user."""
```

### Super Admin Routes (`super_admin_routes.py`)

All routes are protected and verify requester is super admin before proceeding.

---

## Frontend Implementation

### Super Admin Dashboard Component
Location: `src/features/dashboard/components/SuperAdminDashboard.tsx`

#### Features
1. **Tabs Navigation**
   - Dashboard Stats
   - Super Admins
   - All Users

2. **Dashboard Stats Tab**
   - Total Users card with user count
   - Super Admins card with super admin count
   - Total Roles card
   - Total Permissions card

3. **Super Admins Tab**
   - List all super admin users
   - Display user email, business name, roles, and creation date
   - Demote button for each super admin

4. **All Users Tab**
   - Table view of all system users
   - Columns: Business Name, Email, Status (Super Admin/Regular User), Roles, Actions
   - Promote to super admin button for regular users
   - Demote button for super admins
   - Delete user button

### Navigation Integration
The Super Admin menu is integrated into the main dashboard navigation:
- Icon: Crown (👑)
- Path: `/dashboard/super-admin`
- Accessible via sidebar menu

---

## Usage Guide

### For Users (Initialization)

#### Step 1: Identify Initial Administrator
1. First user to register is typically the initial administrator
2. This user should have technical knowledge for system setup

#### Step 2: Promote First Super Admin
Use the initialization endpoint to promote the first user:
```bash
POST http://localhost:8000/api/super-admin/initialize-super-admin
Body: { "email": "admin@company.com" }
```

#### Step 3: Access Super Admin Dashboard
1. Log in as the super admin user
2. Navigate to Dashboard → Super Admin
3. Manage users, roles, and permissions

### For Super Admins

#### Managing Users
1. Go to Super Admin Dashboard → All Users tab
2. Click promote/demote/delete buttons as needed
3. Confirm actions in dialogs

#### Viewing System Statistics
1. Go to Super Admin Dashboard → Dashboard Stats tab
2. Review system metrics at a glance

#### Managing Super Admins
1. Go to Super Admin Dashboard → Super Admins tab
2. View current super admins
3. Demote specific users if needed

---

## Security Considerations

### Protections Implemented

1. **Dual Verification**
   - `is_super_admin` field on User model
   - "Super Admin" role assignment
   - Both must be checked for maximum security

2. **Self-Protection**
   - Cannot demote yourself
   - Cannot delete yourself
   - Prevents accidental lockout

3. **Permission Checks**
   - All super admin endpoints verify requester is super admin
   - Unauthorized attempts return 403 Forbidden
   - Audit logging available for all operations

4. **Role Enforcement**
   - Super Admin role has all permissions
   - Individual permissions still checked at resource level
   - Multi-layer authorization system

### Best Practices

1. **Initial Setup**
   - Promote only trusted individuals to super admin
   - Keep super admin count minimal (1-3 recommended)
   - Use strong passwords for super admin accounts

2. **Ongoing Management**
   - Regularly audit super admin accounts
   - Remove unnecessary super admins
   - Monitor user promotion/demotion activity
   - Keep audit logs for compliance

3. **Password Security**
   - Enforce strong password policy
   - Require regular password changes
   - Implement multi-factor authentication (future)

---

## Configuration

### Environment Variables
No additional environment variables required for super admin system.

### Settings
All super admin functionality uses existing configuration:
- `DATABASE_URL`: MySQL database connection
- `SECRET_KEY`: Used for JWT tokens (if implemented)
- `ALLOWED_ORIGINS`: CORS allowed origins

---

## Troubleshooting

### Issue: "Unknown column 'is_super_admin'"
**Solution**: Run the migration script
```bash
python migrate_super_admin.py
```

### Issue: Cannot access Super Admin Dashboard
**Cause**: User is not a super admin
**Solution**: Have an existing super admin promote you

### Issue: Roles not loading in Super Admin Dashboard
**Cause**: API connection issue
**Solution**: 
1. Verify backend is running on port 8000
2. Check browser console for errors
3. Verify CORS is configured correctly

### Issue: Cannot delete a user
**Cause**: User might have dependent data (emissions, etc.)
**Solution**: 
1. Delete user's emissions first
2. Then delete the user
3. Or use cascading delete if configured

---

## Future Enhancements

1. **Audit Logging**
   - Log all super admin actions
   - Maintain change history
   - Support compliance requirements

2. **Multi-Factor Authentication**
   - Require MFA for super admin accounts
   - Protect against unauthorized access

3. **API Key Management**
   - Generate API keys for super admin automation
   - Token-based authentication

4. **Scheduled Reports**
   - Generate system health reports
   - Email notifications to super admins
   - User activity summaries

5. **Advanced Permissions**
   - Custom role creation with selected permissions
   - Role templates for common scenarios
   - Permission delegation

---

## API Testing

### Test Create First Super Admin
```bash
curl -X POST http://localhost:8000/api/super-admin/initialize-super-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "testatiq@atiq.com"}'
```

### Test Get Dashboard Stats
```bash
curl http://localhost:8000/api/super-admin/dashboard/stats
```

### Test Get All Super Admins
```bash
curl http://localhost:8000/api/super-admin/users/super-admins
```

### Test Promote User
```bash
curl -X POST http://localhost:8000/api/super-admin/users/2/promote \
  -H "Content-Type: application/json" \
  -d '{"requester_id": 1}'
```

---

## Support

For issues or questions about the Super Admin system:
1. Check the troubleshooting section above
2. Review API endpoint documentation
3. Check browser console for client-side errors
4. Check backend logs for server-side errors

---

*Last Updated: January 24, 2026*
*Version: 1.0.0*
