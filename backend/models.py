import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from backend.db import Base

class User(SQLAlchemyBaseUserTableUUID, Base):
    nombre: Mapped[str] = mapped_column(String(length=100), nullable=False)
    rfc: Mapped[str] = mapped_column(String(length=13), nullable=False)
