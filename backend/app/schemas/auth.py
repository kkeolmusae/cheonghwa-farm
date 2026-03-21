from pydantic import BaseModel, EmailStr, Field


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str
