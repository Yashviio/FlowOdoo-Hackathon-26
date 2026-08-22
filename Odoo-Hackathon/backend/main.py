import secrets
from datetime import date
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db, engine, Base
from backend.models import (
    User, City, PredefinedActivity, Trip, Stop, Activity, SavedDestination,
    UserRegister, UserLogin, UserProfileUpdate, UserOut, Token,
    CityOut, CityDetailOut, PredefinedActivityOut,
    TripCreate, TripUpdate, TripOut, TripDetailOut,
    StopCreate, StopOut, StopReorder,
    ActivityCreate, ActivityOut,
    SavedDestinationCreate, SavedDestinationOut, AdminAnalyticsOut, PopularCityStats
)
from backend.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_admin
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GlobeTrotter API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        name=f"{user_data.first_name} {user_data.last_name}",
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number or "",
        city=user_data.city or "",
        country=user_data.country or "",
        additional_info=user_data.additional_info or "",
        profile_picture=user_data.profile_picture or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/api/auth/profile", response_model=UserOut)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    if profile_data.phone_number is not None:
        current_user.phone_number = profile_data.phone_number
    if profile_data.city is not None:
        current_user.city = profile_data.city
    if profile_data.country is not None:
        current_user.country = profile_data.country
    if profile_data.additional_info is not None:
        current_user.additional_info = profile_data.additional_info
        
    if profile_data.first_name is not None or profile_data.last_name is not None:
        current_user.name = f"{current_user.first_name} {current_user.last_name}"
        
    if profile_data.profile_picture is not None:
        current_user.profile_picture = profile_data.profile_picture
    if profile_data.language is not None:
        current_user.language = profile_data.language
    if profile_data.password is not None:
        if len(profile_data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        current_user.hashed_password = get_password_hash(profile_data.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user


# --- CITY & DESTINATION ENDPOINTS ---

@app.get("/api/cities", response_model=List[CityOut])
def get_cities(
    search: Optional[str] = Query(None, description="Search by city or country name"),
    region: Optional[str] = Query(None, description="Filter by region"),
    cost_index: Optional[int] = Query(None, description="Filter by cost index 1-5"),
    popularity: Optional[int] = Query(None, description="Filter by popularity index 1-5"),
    db: Session = Depends(get_db)
):
    query = db.query(City)
    if search:
        query = query.filter(
            (City.name.ilike(f"%{search}%")) | (City.country.ilike(f"%{search}%"))
        )
    if region:
        query = query.filter(City.region.ilike(region))
    if cost_index:
        query = query.filter(City.cost_index == cost_index)
    if popularity:
        query = query.filter(City.popularity == popularity)
        
    return query.all()

@app.get("/api/cities/{city_id}", response_model=CityDetailOut)
def get_city_details(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city

@app.get("/api/cities/{city_id}/activities", response_model=List[PredefinedActivityOut])
def get_city_activities(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city.predefined_activities


# --- SAVED DESTINATIONS ENDPOINTS ---

@app.get("/api/cities/saved/list", response_model=List[SavedDestinationOut])
def get_saved_destinations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SavedDestination).filter(SavedDestination.user_id == current_user.id).all()

@app.post("/api/cities/saved/toggle", status_code=status.HTTP_200_OK)
def toggle_saved_destination(
    data: SavedDestinationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    city = db.query(City).filter(City.id == data.city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
        
    existing = db.query(SavedDestination).filter(
        SavedDestination.user_id == current_user.id,
        SavedDestination.city_id == data.city_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "City removed from saved list"}
    else:
        new_saved = SavedDestination(user_id=current_user.id, city_id=data.city_id)
        db.add(new_saved)
        db.commit()
        return {"saved": True, "message": "City added to saved list"}


# --- TRIP ENDPOINTS ---

@app.get("/api/trips", response_model=List[TripDetailOut])
def get_user_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Trip).filter(Trip.user_id == current_user.id).all()

@app.post("/api/trips", response_model=TripDetailOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_data: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if trip_data.start_date > trip_data.end_date:
        raise HTTPException(status_code=400, detail="Start date must be on or before end date")
        
    new_trip = Trip(
        user_id=current_user.id,
        name=trip_data.name,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        description=trip_data.description or "",
        cover_photo=trip_data.cover_photo or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        is_public=False,
        share_token=secrets.token_urlsafe(12),
        total_budget=trip_data.total_budget or 0.0
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@app.get("/api/trips/{trip_id}", response_model=TripDetailOut)
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@app.put("/api/trips/{trip_id}", response_model=TripDetailOut)
def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip_data.name is not None:
        trip.name = trip_data.name
    if trip_data.start_date is not None:
        trip.start_date = trip_data.start_date
    if trip_data.end_date is not None:
        trip.end_date = trip_data.end_date
    if trip_data.description is not None:
        trip.description = trip_data.description
    if trip_data.cover_photo is not None:
        trip.cover_photo = trip_data.cover_photo
    if trip_data.is_public is not None:
        trip.is_public = trip_data.is_public
    if trip_data.total_budget is not None:
        trip.total_budget = trip_data.total_budget
        
    if trip.start_date > trip.end_date:
        raise HTTPException(status_code=400, detail="Start date must be on or before end date")
        
    db.commit()
    db.refresh(trip)
    return trip

@app.delete("/api/trips/{trip_id}", status_code=status.HTTP_200_OK)
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}


# --- PUBLIC SHARING ENDPOINTS ---

@app.get("/api/trips/share/{share_token}", response_model=TripDetailOut)
def get_shared_trip(share_token: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.share_token == share_token).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
    if not trip.is_public:
        raise HTTPException(status_code=403, detail="This trip is private")
    return trip

@app.post("/api/trips/share/{share_token}/copy", response_model=TripDetailOut)
def copy_shared_trip(
    share_token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source_trip = db.query(Trip).filter(Trip.share_token == share_token).first()
    if not source_trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
    if not source_trip.is_public:
        raise HTTPException(status_code=403, detail="This trip is private and cannot be copied")
        
    # Copy Trip Details
    copied_trip = Trip(
        user_id=current_user.id,
        name=f"Copy of {source_trip.name}",
        start_date=source_trip.start_date,
        end_date=source_trip.end_date,
        description=source_trip.description,
        cover_photo=source_trip.cover_photo,
        is_public=False,
        share_token=secrets.token_urlsafe(12),
        total_budget=source_trip.total_budget
    )
    db.add(copied_trip)
    db.commit()
    db.refresh(copied_trip)
    
    # Copy Stops and Activities
    for source_stop in source_trip.stops:
        copied_stop = Stop(
            trip_id=copied_trip.id,
            city_id=source_stop.city_id,
            arrival_date=source_stop.arrival_date,
            departure_date=source_stop.departure_date,
            order_index=source_stop.order_index
        )
        db.add(copied_stop)
        db.commit()
        db.refresh(copied_stop)
        
        for source_activity in source_stop.activities:
            copied_activity = Activity(
                stop_id=copied_stop.id,
                title=source_activity.title,
                description=source_activity.description,
                category=source_activity.category,
                cost=source_activity.cost,
                start_time=source_activity.start_time,
                duration_minutes=source_activity.duration_minutes,
                order_index=source_activity.order_index
            )
            db.add(copied_activity)
            
    db.commit()
    db.refresh(copied_trip)
    return copied_trip


# --- ITINERARY STOP ENDPOINTS ---

@app.post("/api/trips/{trip_id}/stops", response_model=StopOut, status_code=status.HTTP_201_CREATED)
def add_stop(
    trip_id: int,
    stop_data: StopCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    city = db.query(City).filter(City.id == stop_data.city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
        
    # Validations
    if stop_data.arrival_date > stop_data.departure_date:
        raise HTTPException(status_code=400, detail="Arrival date must be before departure date")
        
    new_stop = Stop(
        trip_id=trip.id,
        city_id=stop_data.city_id,
        arrival_date=stop_data.arrival_date,
        departure_date=stop_data.departure_date,
        order_index=stop_data.order_index
    )
    db.add(new_stop)
    db.commit()
    db.refresh(new_stop)
    return new_stop

@app.put("/api/trips/{trip_id}/stops/reorder", response_model=List[StopOut])
def reorder_stops(
    trip_id: int,
    reorder_data: StopReorder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    for index, stop_id in enumerate(reorder_data.stop_ids):
        stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip.id).first()
        if stop:
            stop.order_index = index
            
    db.commit()
    return db.query(Stop).filter(Stop.trip_id == trip.id).order_by(Stop.order_index).all()

@app.put("/api/trips/{trip_id}/stops/{stop_id}", response_model=StopOut)
def update_stop(
    trip_id: int,
    stop_id: int,
    arrival_date: date,
    departure_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    if arrival_date > departure_date:
        raise HTTPException(status_code=400, detail="Arrival date must be before departure date")
        
    stop.arrival_date = arrival_date
    stop.departure_date = departure_date
    db.commit()
    db.refresh(stop)
    return stop

@app.delete("/api/trips/{trip_id}/stops/{stop_id}", status_code=status.HTTP_200_OK)
def delete_stop(
    trip_id: int,
    stop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    db.delete(stop)
    db.commit()
    return {"message": "Stop removed from itinerary"}


# --- ACTIVITY ENDPOINTS ---

@app.post("/api/trips/{trip_id}/stops/{stop_id}/activities", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def add_activity(
    trip_id: int,
    stop_id: int,
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    new_activity = Activity(
        stop_id=stop.id,
        title=activity_data.title,
        description=activity_data.description or "",
        category=activity_data.category or "Sightseeing",
        cost=activity_data.cost or 0.0,
        start_time=activity_data.start_time or "10:00",
        duration_minutes=activity_data.duration_minutes or 60,
        order_index=activity_data.order_index or 0
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    return new_activity

@app.put("/api/trips/{trip_id}/stops/{stop_id}/activities/reorder", response_model=List[ActivityOut])
def reorder_activities(
    trip_id: int,
    stop_id: int,
    reorder_data: StopReorder,  # reuses List[int] schema
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    for index, act_id in enumerate(reorder_data.stop_ids):
        activity = db.query(Activity).filter(Activity.id == act_id, Activity.stop_id == stop.id).first()
        if activity:
            activity.order_index = index
            
    db.commit()
    return db.query(Activity).filter(Activity.stop_id == stop.id).order_by(Activity.order_index).all()

@app.put("/api/trips/{trip_id}/stops/{stop_id}/activities/{activity_id}", response_model=ActivityOut)
def update_activity(
    trip_id: int,
    stop_id: int,
    activity_id: int,
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.stop_id == stop_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    activity.title = activity_data.title
    activity.description = activity_data.description
    activity.category = activity_data.category
    activity.cost = activity_data.cost
    activity.start_time = activity_data.start_time
    activity.duration_minutes = activity_data.duration_minutes
    if activity_data.order_index is not None:
        activity.order_index = activity_data.order_index
        
    db.commit()
    db.refresh(activity)
    return activity

@app.delete("/api/trips/{trip_id}/stops/{stop_id}/activities/{activity_id}", status_code=status.HTTP_200_OK)
def delete_activity(
    trip_id: int,
    stop_id: int,
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.stop_id == stop_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted successfully"}


# --- ADMIN ANALYTICS ENDPOINTS ---

@app.get("/api/admin/analytics", response_model=AdminAnalyticsOut)
def get_admin_analytics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_trips = db.query(Trip).count()
    total_stops = db.query(Stop).count()
    total_activities = db.query(Activity).count()
    
    # Popular cities (cities linked to most stops)
    popular_cities_query = db.query(
        City.name, City.country, func.count(Stop.id).label("trip_count")
    ).join(Stop, Stop.city_id == City.id).group_by(City.id).order_by(func.count(Stop.id).desc()).limit(5).all()
    
    popular_cities = [
        PopularCityStats(city_name=res[0], country=res[1], trip_count=res[2])
        for res in popular_cities_query
    ]
    
    # If no trips are registered yet, populate dummy data for chart compatibility
    if not popular_cities:
        popular_cities = [
            PopularCityStats(city_name="Paris", country="France", trip_count=1),
            PopularCityStats(city_name="Rome", country="Italy", trip_count=1),
        ]
        
    # Trips over time: group by trip start_date or date created (using start_date for trend representation)
    trips_over_time_query = db.query(
        Trip.start_date, func.count(Trip.id).label("count")
    ).group_by(Trip.start_date).order_by(Trip.start_date.asc()).limit(15).all()
    
    trips_over_time = [
        {"date": str(res[0]), "count": res[1]}
        for res in trips_over_time_query
    ]
    
    if not trips_over_time:
        trips_over_time = [{"date": str(date.today()), "count": 1}]
        
    return AdminAnalyticsOut(
        total_users=total_users,
        total_trips=total_trips,
        total_stops=total_stops,
        total_activities=total_activities,
        popular_cities=popular_cities,
        trips_over_time=trips_over_time
    )
