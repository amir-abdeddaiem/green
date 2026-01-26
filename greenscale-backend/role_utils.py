"""Utility functions for role and permission management."""

from sqlalchemy.orm import Session
from role_models import Role, Permission
from models import User
from typing import List


def get_user_permissions(db: Session, user_id: int) -> List[str]:
    """Get all permissions for a user based on their roles."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    permissions = set()
    for role in user.roles:
        for permission in role.permissions:
            permissions.add(permission.name)

    return list(permissions)


def get_user_roles(db: Session, user_id: int) -> List[str]:
    """Get all roles for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    return [role.name for role in user.roles]


def has_permission(db: Session, user_id: int, permission_name: str) -> bool:
    """Check if user has a specific permission."""
    permissions = get_user_permissions(db, user_id)
    return permission_name in permissions


def has_role(db: Session, user_id: int, role_name: str) -> bool:
    """Check if user has a specific role."""
    roles = get_user_roles(db, user_id)
    return role_name in roles


def has_any_permission(db: Session, user_id: int, permission_names: List[str]) -> bool:
    """Check if user has any of the given permissions."""
    permissions = get_user_permissions(db, user_id)
    return any(perm in permissions for perm in permission_names)


def has_all_permissions(db: Session, user_id: int, permission_names: List[str]) -> bool:
    """Check if user has all of the given permissions."""
    permissions = get_user_permissions(db, user_id)
    return all(perm in permissions for perm in permission_names)


def assign_role_to_user(db: Session, user_id: int, role_id: int) -> bool:
    """Assign a role to a user."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        role = db.query(Role).filter(Role.id == role_id).first()

        if not user or not role:
            return False

        if role not in user.roles:
            user.roles.append(role)
            db.commit()
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error assigning role: {e}")
        db.rollback()
        return False


def remove_role_from_user(db: Session, user_id: int, role_id: int) -> bool:
    """Remove a role from a user."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        role = db.query(Role).filter(Role.id == role_id).first()

        if not user or not role:
            return False

        if role in user.roles:
            user.roles.remove(role)
            db.commit()
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error removing role: {e}")
        db.rollback()
        return False


def assign_permission_to_role(db: Session, role_id: int, permission_id: int) -> bool:
    """Assign a permission to a role."""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        permission = db.query(Permission).filter(Permission.id == permission_id).first()

        if not role or not permission:
            return False

        if permission not in role.permissions:
            role.permissions.append(permission)
            db.commit()
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error assigning permission: {e}")
        db.rollback()
        return False


def remove_permission_from_role(db: Session, role_id: int, permission_id: int) -> bool:
    """Remove a permission from a role."""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        permission = db.query(Permission).filter(Permission.id == permission_id).first()

        if not role or not permission:
            return False

        if permission in role.permissions:
            role.permissions.remove(permission)
            db.commit()
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error removing permission: {e}")
        db.rollback()
        return False


def create_default_roles_and_permissions(db: Session):
    """Create default roles and permissions if they don't exist."""
    from role_models import DEFAULT_PERMISSIONS, DEFAULT_ROLES

    # Create default permissions
    for perm_name, perm_desc, perm_category in DEFAULT_PERMISSIONS:
        existing = db.query(Permission).filter(Permission.name == perm_name).first()
        if not existing:
            permission = Permission(
                name=perm_name,
                description=perm_desc,
                category=perm_category
            )
            db.add(permission)
    db.commit()

    # Create default roles with permissions
    for role_name, role_data in DEFAULT_ROLES.items():
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        if not existing_role:
            role = Role(
                name=role_name,
                description=role_data["description"]
            )
            # Attach permissions to role
            for perm_name in role_data["permissions"]:
                permission = db.query(Permission).filter(Permission.name == perm_name).first()
                if permission:
                    role.permissions.append(permission)
            db.add(role)
    db.commit()

    print("✅ Default roles and permissions created successfully!")


# ===== SUPER ADMIN FUNCTIONS =====

def is_super_admin(db: Session, user_id: int) -> bool:
    """Check if a user is a super admin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    return user.is_super_admin is True


def get_super_admin_users(db: Session) -> List[User]:
    """Get all super admin users."""
    return db.query(User).filter(User.is_super_admin == True).all()


def promote_to_super_admin(db: Session, user_id: int) -> bool:
    """Promote a user to super admin status."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        user.is_super_admin = True
        
        # Also assign Super Admin role if it exists
        super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
        if super_admin_role and super_admin_role not in user.roles:
            user.roles.append(super_admin_role)
        
        db.commit()
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error promoting user to super admin: {e}")
        db.rollback()
        return False


def demote_from_super_admin(db: Session, user_id: int) -> bool:
    """Demote a user from super admin status."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        user.is_super_admin = False
        db.commit()
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error demoting user from super admin: {e}")
        db.rollback()
        return False


def assign_super_admin_role(db: Session, user_id: int) -> bool:
    """Assign Super Admin role to a user."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
        if not super_admin_role:
            return False
        
        if super_admin_role not in user.roles:
            user.roles.append(super_admin_role)
            db.commit()
        
        return True
    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error assigning Super Admin role: {e}")
        db.rollback()
        return False
