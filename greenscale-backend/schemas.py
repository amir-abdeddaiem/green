from pydantic import BaseModel, EmailStr

# For Registration
class UserCreate(BaseModel):
    business_name: str
    email: EmailStr
    password: str

# ADD THIS: For Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# For Sending Data Back to React
class UserResponse(BaseModel):
    id: int
    business_name: str
    email: EmailStr

    class Config:
        from_attributes = True