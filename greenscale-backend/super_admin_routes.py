"""Super Admin management API endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from role_utils import (
    is_super_admin,
    get_super_admin_users,
    promote_to_super_admin,
    demote_from_super_admin,
    get_user_permissions,
    get_user_roles
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/super-admin", tags=["super-admin"])


# ===== SCHEMAS =====

class SuperAdminUserResponse(BaseModel):
    """Response model for super admin user info."""
    id: int
    email: str
    business_name: str
    is_super_admin: bool
    roles: List[str]
    permissions: List[str]
    created_at: str

    class Config:
        from_attributes = True


class PromoteUserRequest(BaseModel):
    """Request model to promote a user to super admin."""
    user_id: int
    promote: bool = True


class SuperAdminDashboardStats(BaseModel):
    """Response model for super admin dashboard statistics."""
    total_users: int
    total_super_admins: int
    total_roles: int
    total_permissions: int


class CreateUserRequest(BaseModel):
    """Request model to create a new user."""
    business_name: str
    email: str
    password: str
    role_ids: List[int] = []


# ===== UTILITY FUNCTIONS =====

def verify_super_admin(db: Session, user_id: int) -> User:
    """Verify that the requesting user is a super admin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not is_super_admin(db, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return user


def get_current_user_id(authorization: str = None) -> int:
    """Extract user ID from authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    try:
        # This is a simple extraction; in production, you'd decode JWT
        parts = authorization.split()
        if len(parts) == 2:
            return int(parts[1])
    except (ValueError, IndexError):
        pass
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authorization header"
    )


# ===== ENDPOINTS =====

@router.get("/dashboard/stats", response_model=SuperAdminDashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get super admin dashboard statistics."""
    from role_models import Role, Permission
    
    total_users = db.query(User).count()
    total_super_admins = db.query(User).filter(User.is_super_admin == True).count()
    total_roles = db.query(Role).count()
    total_permissions = db.query(Permission).count()
    
    return SuperAdminDashboardStats(
        total_users=total_users,
        total_super_admins=total_super_admins,
        total_roles=total_roles,
        total_permissions=total_permissions
    )


@router.get("/users/super-admins", response_model=List[SuperAdminUserResponse])
def get_all_super_admins(db: Session = Depends(get_db)):
    """Get all super admin users."""
    super_admins = get_super_admin_users(db)
    
    result = []
    for user in super_admins:
        result.append(SuperAdminUserResponse(
            id=user.id,
            email=user.email,
            business_name=user.business_name,
            is_super_admin=user.is_super_admin,
            roles=get_user_roles(db, user.id),
            permissions=get_user_permissions(db, user.id),
            created_at=user.created_at.isoformat() if user.created_at else None
        ))
    
    return result


@router.get("/users/{user_id}/is-super-admin")
def check_super_admin_status(user_id: int, db: Session = Depends(get_db)):
    """Check if a user is a super admin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "user_id": user_id,
        "email": user.email,
        "is_super_admin": user.is_super_admin,
        "roles": get_user_roles(db, user_id)
    }


@router.post("/users/{user_id}/promote")
def promote_user_to_super_admin(
    user_id: int,
    requester_id: int = 1,  # Default to first user for now
    db: Session = Depends(get_db)
):
    """Promote a user to super admin status."""
    # Verify requester is super admin
    requester = db.query(User).filter(User.id == requester_id).first()
    if not requester or not is_super_admin(db, requester_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can promote users"
        )
    
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )
    
    # Promote the user
    if promote_to_super_admin(db, user_id):
        logger.info("User %s promoted to super admin by %s", user_id, requester_id)
        return {
            "success": True,
            "message": f"User {target_user.email} promoted to super admin",
            "user_id": user_id,
            "is_super_admin": True
        }
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to promote user"
    )


@router.post("/users/{user_id}/demote")
def demote_user_from_super_admin(
    user_id: int,
    requester_id: int = 1,  # Default to first user for now
    db: Session = Depends(get_db)
):
    """Demote a user from super admin status."""
    # Verify requester is super admin
    requester = db.query(User).filter(User.id == requester_id).first()
    if not requester or not is_super_admin(db, requester_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can demote users"
        )
    
    # Prevent self-demotion
    if requester_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself"
        )
    
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )
    
    # Demote the user
    if demote_from_super_admin(db, user_id):
        logger.info("User %s demoted from super admin by %s", user_id, requester_id)
        return {
            "success": True,
            "message": f"User {target_user.email} demoted from super admin",
            "user_id": user_id,
            "is_super_admin": False
        }
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to demote user"
    )


@router.get("/users", response_model=List[SuperAdminUserResponse])
def get_all_users_for_super_admin(db: Session = Depends(get_db)):
    """Get all users (super admin only)."""
    users = db.query(User).all()
    
    result = []
    for user in users:
        result.append(SuperAdminUserResponse(
            id=user.id,
            email=user.email,
            business_name=user.business_name,
            is_super_admin=user.is_super_admin,
            roles=get_user_roles(db, user.id),
            permissions=get_user_permissions(db, user.id),
            created_at=user.created_at.isoformat() if user.created_at else None
        ))
    
    return result


@router.delete("/users/{user_id}")
def delete_user_as_super_admin(
    user_id: int,
    requester_id: int = 1,  # Default to first user for now
    db: Session = Depends(get_db)
):
    """Delete a user (super admin only)."""
    # Verify requester is super admin
    requester = db.query(User).filter(User.id == requester_id).first()
    if not requester or not is_super_admin(db, requester_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can delete users"
        )
    
    # Prevent self-deletion
    if requester_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        db.delete(target_user)
        db.commit()
        logger.info("User %s deleted by super admin %s", user_id, requester_id)
        return {
            "success": True,
            "message": f"User {target_user.email} deleted successfully"
        }
    except Exception as e:
        db.rollback()
        logger.error("Error deleting user: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        ) from e


@router.post("/initialize-super-admin")
def initialize_first_super_admin(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Initialize the first super admin.
    This endpoint can only be used if no super admins exist.
    """
    # Check if any super admins already exist
    existing_super_admins = db.query(User).filter(User.is_super_admin == True).count()
    if existing_super_admins > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin already exists. Use /promote endpoint instead."
        )
    
    # Find the user by email
    user = db.query(User).filter(User.email.ilike(email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Promote to super admin
    if promote_to_super_admin(db, user.id):
        logger.info("First super admin initialized: %s", email)
        return {
            "success": True,
            "message": f"User {email} promoted to super admin",
            "user_id": user.id,
            "is_super_admin": True
        }
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to initialize super admin"
    )


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """Get all users with their roles."""
    try:
        users = db.query(User).all()
        users_data = []
        
        for user in users:
            users_data.append({
                "id": user.id,
                "business_name": user.business_name,
                "email": user.email,
                "roles": [{"id": r.id, "name": r.name, "description": r.description} for r in user.roles],
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "is_super_admin": user.is_super_admin
            })
        
        return {"users": users_data}
    except Exception as e:
        logger.error("Error fetching users: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        ) from e


@router.post("/create-user")
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    requester_id: int = 1  # In production, extract from JWT token
):
    """Create a new user with optional roles (super admin only)."""
    try:
        from role_models import Role
        import auth_utils
        
        # ===== SECURITY CHECK: Verify requester is super admin =====
        requester = db.query(User).filter(User.id == requester_id).first()
        if not requester:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Requester user not found"
            )
        
        if not is_super_admin(db, requester_id):
            logger.warning(
                "🚨 SECURITY: Unauthorized user creation attempt by user %s (%s)",
                requester_id,
                requester.email
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin access required to create users"
            )
        
        logger.info("✅ User creation authorized for super admin: %s", requester.email)
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        
        # Hash the password
        hashed_password = auth_utils.hash_password(request.password)
        
        # Create new user
        new_user = User(
            business_name=request.business_name,
            email=request.email,
            password=hashed_password
        )
        
        db.add(new_user)
        db.flush()  # Flush to get the user ID
        
        # Assign roles if provided
        if request.role_ids:
            roles = db.query(Role).filter(Role.id.in_(request.role_ids)).all()
            for role in roles:
                new_user.roles.append(role)
        
        db.commit()
        db.refresh(new_user)
        
        logger.info(
            "✅ New user created by super admin %s: %s (%s)",
            requester.email,
            request.business_name,
            request.email
        )
        
        return {
            "success": True,
            "message": f"User {request.business_name} created successfully",
            "user_id": new_user.id,
            "email": new_user.email,
            "created_by": requester.email
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("❌ Error creating user: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        ) from e
