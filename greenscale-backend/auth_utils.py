"""Authentication utilities for password hashing and verification."""

from passlib.context import CryptContext

# Tell passlib to use bcrypt for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    """Hash password with bcrypt (max 72 bytes)."""
    # Truncate password to 72 bytes (bcrypt max)
    truncated = password[:72]
    return pwd_context.hash(truncated)


def verify_password(plain_password: str, hashed_password: str):
    """Verify plain password against hashed password (max 72 bytes)."""
    # Truncate password to 72 bytes for verification
    truncated = plain_password[:72]
    return pwd_context.verify(truncated, hashed_password)
