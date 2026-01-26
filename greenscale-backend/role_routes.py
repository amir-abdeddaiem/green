"""Role and Permission management API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from role_models import Role, Permission
from role_schemas import (
    Role as RoleSchema,
    RoleCreate,
    RoleUpdate, 
    Permission as PermissionSchema,
    PermissionCreate,
    UserRoleAssign,
    PermissionCheckResponse,
)
from role_utils import (
    get_user_permissions,
    get_user_roles,
    has_permission,
    assign_role_to_user,
    remove_role_from_user,
)
from models import User

router = APIRouter(prefix="/roles", tags=["roles"])


# ===== ROLE ENDPOINTS =====

@router.get("/", response_model=List[dict])
def get_all_roles(db: Session = Depends(get_db)):
    """Get all roles with user counts."""
    roles = db.query(Role).all()
    return [
        {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "permissions": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "category": p.category,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in role.permissions
            ],
            "created_at": role.created_at.isoformat() if role.created_at else None,
            "user_count": len(role.users)
        }
        for role in roles
    ]


@router.get("/{role_id}", response_model=RoleSchema)
def get_role(role_id: int, db: Session = Depends(get_db)):
    """Get a specific role by ID."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.post("/", response_model=RoleSchema, status_code=status.HTTP_201_CREATED)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    """Create a new role."""
    existing = db.query(Role).filter(Role.name == role.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(name=role.name, description=role.description)

    # Assign permissions if provided
    if role.permission_ids:
        for perm_id in role.permission_ids:
            permission = db.query(Permission).filter(Permission.id == perm_id).first()
            if permission:
                new_role.permissions.append(permission)

    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role


@router.put("/{role_id}", response_model=RoleSchema)
def update_role(role_id: int, role_update: RoleUpdate, db: Session = Depends(get_db)):
    """Update a role."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if role_update.description is not None:
        role.description = role_update.description

    if role_update.permission_ids is not None:
        role.permissions = []
        for perm_id in role_update.permission_ids:
            permission = db.query(Permission).filter(Permission.id == perm_id).first()
            if permission:
                role.permissions.append(permission)

    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_200_OK)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    """Delete a role."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Check if role is in use
    if len(role.users) > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete role. {len(role.users)} users still have this role."
        )

    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}


# ===== PERMISSION ENDPOINTS =====

@router.get("/permissions/", response_model=List[dict])
def get_all_permissions(
    category: str = None,
    db: Session = Depends(get_db)
):
    """Get all permissions, optionally filtered by category."""
    query = db.query(Permission)
    if category:
        query = query.filter(Permission.category == category)
    
    permissions = query.all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in permissions
    ]


@router.get("/permissions/{permission_id}", response_model=PermissionSchema)
def get_permission(permission_id: int, db: Session = Depends(get_db)):
    """Get a specific permission by ID."""
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.post("/permissions/", response_model=PermissionSchema, status_code=status.HTTP_201_CREATED)
def create_permission(permission: PermissionCreate, db: Session = Depends(get_db)):
    """Create a new permission."""
    existing = db.query(Permission).filter(Permission.name == permission.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Permission already exists")

    new_permission = Permission(
        name=permission.name,
        description=permission.description,
        category=permission.category
    )
    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)
    return new_permission


# ===== USER ROLE MANAGEMENT ENDPOINTS =====

@router.post("/assign-role/", status_code=status.HTTP_200_OK)
def assign_role(assignment: UserRoleAssign, db: Session = Depends(get_db)):
    """Assign roles to a user."""
    user = db.query(User).filter(User.id == assignment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    assigned_roles = []
    failed_roles = []

    for role_id in assignment.role_ids:
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
            if assign_role_to_user(db, assignment.user_id, role_id):
                assigned_roles.append(role.name)
            else:
                failed_roles.append(role_id)
        else:
            failed_roles.append(role_id)

    return {
        "user_id": assignment.user_id,
        "assigned_roles": assigned_roles,
        "failed_roles": failed_roles,
        "message": f"Assigned {len(assigned_roles)} roles to user"
    }


@router.post("/remove-role/", status_code=status.HTTP_200_OK)
def remove_role(user_id: int, role_id: int, db: Session = Depends(get_db)):
    """Remove a role from a user."""
    if remove_role_from_user(db, user_id, role_id):
        return {"message": "Role removed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to remove role")


@router.get("/user/{user_id}/roles", response_model=List[str])
def get_user_roles_endpoint(user_id: int, db: Session = Depends(get_db)):
    """Get all roles for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_roles(db, user_id)


@router.get("/user/{user_id}/permissions", response_model=List[str])
def get_user_permissions_endpoint(user_id: int, db: Session = Depends(get_db)):
    """Get all permissions for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_permissions(db, user_id)


@router.post("/user/{user_id}/check-permission", response_model=PermissionCheckResponse)
def check_user_permission(user_id: int, permission: str, db: Session = Depends(get_db)):
    """Check if user has a specific permission."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    has_perm = has_permission(db, user_id, permission)
    user_roles = get_user_roles(db, user_id)

    return {
        "user_id": user_id,
        "permission": permission,
        "has_permission": has_perm,
        "roles": user_roles
    }
