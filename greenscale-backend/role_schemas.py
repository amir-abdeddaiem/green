"""Pydantic schemas for role and permission management."""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class PermissionBase(BaseModel):
    """Base permission schema."""
    name: str
    description: Optional[str] = None
    category: str


class PermissionCreate(PermissionBase):
    """Schema for creating a permission."""
    pass


class Permission(PermissionBase):
    """Schema for permission response."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    """Base role schema."""
    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    """Schema for creating a role."""
    permission_ids: Optional[List[int]] = None


class RoleUpdate(BaseModel):
    """Schema for updating a role."""
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None


class Role(RoleBase):
    """Schema for role response with permissions."""
    id: int
    permissions: List[Permission] = []
    created_at: datetime

    class Config:
        from_attributes = True


class RoleWithUsers(Role):
    """Schema for role response with user count."""
    user_count: int = 0


class UserRoleBase(BaseModel):
    """Base user role assignment schema."""
    user_id: int
    role_id: int


class UserRoleAssign(BaseModel):
    """Schema for assigning roles to users."""
    user_id: int
    role_ids: List[int]


class UserWithRoles(BaseModel):
    """Schema for user response with roles."""
    id: int
    business_name: str
    email: str
    roles: List[Role] = []
    created_at: datetime

    class Config:
        from_attributes = True


class RolePermissionAssign(BaseModel):
    """Schema for assigning permissions to roles."""
    role_id: int
    permission_ids: List[int]


class PermissionCheck(BaseModel):
    """Schema for checking user permissions."""
    user_id: int
    permission: str


class PermissionCheckResponse(BaseModel):
    """Schema for permission check response."""
    user_id: int
    permission: str
    has_permission: bool
    roles: List[str] = []
