from datetime import date
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr, Field

from backend.database import Base

# SQLAlchemy Models

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    first_name = Column(String, default="")
    last_name = Column(String, default="")
    phone_number = Column(String, default="")
    city = Column(String, default="")
    country = Column(String, default="")
    additional_info = Column(String, default="")
    profile_picture = Column(String, default="")
    language = Column(String, default="en")
    is_admin = Column(Boolean, default=False)

    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    saved_destinations = relationship("SavedDestination", back_populates="user", cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    region = Column(String, nullable=False)
    cost_index = Column(Integer, default=3)  # 1 to 5
    popularity = Column(Integer, default=3)  # 1 to 5
    description = Column(String, default="")
    image_url = Column(String, default="")

    predefined_activities = relationship("PredefinedActivity", back_populates="city", cascade="all, delete-orphan")
    stops = relationship("Stop", back_populates="city")
    saved_by_users = relationship("SavedDestination", back_populates="city", cascade="all, delete-orphan")


class SavedDestination(Base):
    __tablename__ = "saved_destinations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="saved_destinations")
    city = relationship("City", back_populates="saved_by_users")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    description = Column(String, default="")
    cover_photo = Column(String, default="")
    is_public = Column(Boolean, default=False)
    share_token = Column(String, unique=True, index=True, nullable=False)
    total_budget = Column(Float, default=0.0)

    user = relationship("User", back_populates="trips")
    stops = relationship("Stop", back_populates="trip", order_by="Stop.order_index", cascade="all, delete-orphan")


class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False)
    arrival_date = Column(Date, nullable=False)
    departure_date = Column(Date, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="stops")
    activities = relationship("Activity", back_populates="stop", order_by="Activity.order_index", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("stops.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    category = Column(String, default="Sightseeing")  # Sightseeing, Food, Adventure, Transit, Accommodation, Shopping
    cost = Column(Float, default=0.0)
    start_time = Column(String, default="10:00")  # e.g., "14:30"
    duration_minutes = Column(Integer, default=60)
    order_index = Column(Integer, nullable=False, default=0)

    stop = relationship("Stop", back_populates="activities")


class PredefinedActivity(Base):
    __tablename__ = "predefined_activities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    category = Column(String, default="Sightseeing")
    cost = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=60)
    image_url = Column(String, default="")

    city = relationship("City", back_populates="predefined_activities")


# Pydantic Schemas

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone_number: Optional[str] = ""
    city: Optional[str] = ""
    country: Optional[str] = ""
    additional_info: Optional[str] = ""
    profile_picture: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    profile_picture: Optional[str] = None
    language: Optional[str] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    first_name: str
    last_name: str
    phone_number: str
    city: str
    country: str
    additional_info: str
    profile_picture: str
    language: str
    is_admin: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# City Schemas
class PredefinedActivityOut(BaseModel):
    id: int
    city_id: int
    title: str
    description: str
    category: str
    cost: float
    duration_minutes: int
    image_url: str

    class Config:
        from_attributes = True

class CityOut(BaseModel):
    id: int
    name: str
    country: str
    region: str
    cost_index: int
    popularity: int
    description: str
    image_url: str

    class Config:
        from_attributes = True

class CityDetailOut(CityOut):
    predefined_activities: List[PredefinedActivityOut] = []

    class Config:
        from_attributes = True

# Saved Destination Schemas
class SavedDestinationCreate(BaseModel):
    city_id: int

class SavedDestinationOut(BaseModel):
    id: int
    city: CityOut

    class Config:
        from_attributes = True

# Activity Schemas
class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Sightseeing"
    cost: Optional[float] = 0.0
    start_time: Optional[str] = "10:00"
    duration_minutes: Optional[int] = 60
    order_index: Optional[int] = 0

class ActivityOut(BaseModel):
    id: int
    stop_id: int
    title: str
    description: str
    category: str
    cost: float
    start_time: str
    duration_minutes: int
    order_index: int

    class Config:
        from_attributes = True

# Stop Schemas
class StopCreate(BaseModel):
    city_id: int
    arrival_date: date
    departure_date: date
    order_index: Optional[int] = 0

class StopOut(BaseModel):
    id: int
    trip_id: int
    city_id: int
    arrival_date: date
    departure_date: date
    order_index: int
    city: CityOut
    activities: List[ActivityOut] = []

    class Config:
        from_attributes = True

class StopReorder(BaseModel):
    stop_ids: List[int]

# Trip Schemas
class TripCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    description: Optional[str] = ""
    cover_photo: Optional[str] = ""
    total_budget: Optional[float] = 0.0

class TripUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    cover_photo: Optional[str] = None
    is_public: Optional[bool] = None
    total_budget: Optional[float] = None

class TripOut(BaseModel):
    id: int
    user_id: int
    name: str
    start_date: date
    end_date: date
    description: str
    cover_photo: str
    is_public: bool
    share_token: str
    total_budget: float

    class Config:
        from_attributes = True

class TripDetailOut(TripOut):
    stops: List[StopOut] = []

    class Config:
        from_attributes = True

# Analytics Schemas
class PopularCityStats(BaseModel):
    city_name: str
    country: str
    trip_count: int

class AdminAnalyticsOut(BaseModel):
    total_users: int
    total_trips: int
    total_stops: int
    total_activities: int
    popular_cities: List[PopularCityStats]
    trips_over_time: List[dict]  # list of {"date": "YYYY-MM-DD", "count": int}
