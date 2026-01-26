"""Role and Permission models for GreenScale."""

from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, text
from sqlalchemy.orm import relationship
from database import Base
# Import the user_roles table from models to avoid duplicate definition
from models import user_roles_table as user_roles

role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)


class Role(Base):
    """Role model for storing user roles."""
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

    def __repr__(self):
        return f"<Role {self.name}>"


class Permission(Base):
    """Permission model for storing system permissions."""
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=False)  # e.g., "emissions", "reports", "settings", "users"
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relationship
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

    def __repr__(self):
        return f"<Permission {self.name}>"


# Default Permissions that will be seeded
DEFAULT_PERMISSIONS = [
    # Emissions Permissions
    ("view_emissions", "View emissions data", "emissions"),
    ("create_emission", "Create new emission entry", "emissions"),
    ("edit_emission", "Edit emission entries", "emissions"),
    ("delete_emission", "Delete emission entries", "emissions"),

    # Reports Permissions
    ("view_reports", "View reports", "reports"),
    ("create_report", "Create new report", "reports"),
    ("edit_report", "Edit reports", "reports"),
    ("delete_report", "Delete reports", "reports"),
    ("export_report", "Export reports", "reports"),

    # Goals Permissions
    ("view_goals", "View sustainability goals", "goals"),
    ("create_goal", "Create new goal", "goals"),
    ("edit_goal", "Edit goals", "goals"),
    ("delete_goal", "Delete goals", "goals"),

    # Analytics Permissions
    ("view_analytics", "View analytics dashboard", "analytics"),
    ("access_advanced_analytics", "Access advanced analytics features", "analytics"),

    # Settings Permissions
    ("view_settings", "View settings", "settings"),
    ("edit_settings", "Edit settings", "settings"),
    ("manage_team", "Manage team members", "settings"),
    ("manage_roles", "Manage user roles and permissions", "settings"),

    # User Management Permissions
    ("view_users", "View all users", "users"),
    ("create_user", "Create new user", "users"),
    ("edit_user", "Edit user details", "users"),
    ("delete_user", "Delete users", "users"),
    ("assign_role", "Assign roles to users", "users"),

    # Dashboard Permissions
    ("access_dashboard", "Access main dashboard", "dashboard"),
]

# Default Roles with their permissions
DEFAULT_ROLES = {
    "Super Admin": {
        "description": "Complete system access - platform administrator with all permissions",
        "permissions": [p[0] for p in DEFAULT_PERMISSIONS]  # All permissions
    },
    "Admin": {
        "description": "Full system access with all permissions",
        "permissions": [p[0] for p in DEFAULT_PERMISSIONS]  # All permissions
    },
    "Manager": {
        "description": "Manage team, emissions, reports, and goals",
        "permissions": [
            "view_emissions", "create_emission", "edit_emission", "delete_emission",
            "view_reports", "create_report", "edit_report", "export_report",
            "view_goals", "create_goal", "edit_goal",
            "view_analytics", "view_settings", "manage_team",
            "view_users", "access_dashboard"
        ]
    },
    "Team Lead": {
        "description": "Can view and create emissions, reports, and view analytics",
        "permissions": [
            "view_emissions", "create_emission", "edit_emission",
            "view_reports", "create_report", "export_report",
            "view_goals", "view_analytics", "access_dashboard"
        ]
    },
    "Analyst": {
        "description": "View-only access to emissions, reports, and analytics",
        "permissions": [
            "view_emissions", "view_reports", "view_goals",
            "view_analytics", "access_dashboard"
        ]
    },
    "Viewer": {
        "description": "Limited read-only access to dashboards and analytics",
        "permissions": [
            "view_analytics", "access_dashboard"
        ]
    }
}
