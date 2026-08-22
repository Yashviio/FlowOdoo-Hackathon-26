import secrets
from datetime import date, timedelta
from sqlalchemy.orm import Session

from backend.database import SessionLocal, engine, Base
from backend.models import User, City, PredefinedActivity, Trip, Stop, Activity, SavedDestination
from backend.auth import get_password_hash

def seed_data():
    db = SessionLocal()
    
    # 1. Clear existing database
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("Database tables initialized.")
    
    # 2. Seed Users
    admin_password = get_password_hash("admin123")
    user_password = get_password_hash("traveler123")
    
    admin_user = User(
        email="admin@globetrotter.com",
        hashed_password=admin_password,
        name="Super Admin",
        first_name="Super",
        last_name="Admin",
        phone_number="+15550199",
        city="San Francisco",
        country="United States",
        additional_info="System Administrator Profile",
        profile_picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        language="en",
        is_admin=True
    )
    
    regular_user = User(
        email="traveler@globetrotter.com",
        hashed_password=user_password,
        name="Alice Johnson",
        first_name="Alice",
        last_name="Johnson",
        phone_number="+15550144",
        city="New York",
        country="United States",
        additional_info="Avid traveler planning multiple trips around Europe and Asia.",
        profile_picture="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        language="en",
        is_admin=False
    )
    
    db.add(admin_user)
    db.add(regular_user)
    db.commit()
    db.refresh(regular_user)
    db.refresh(admin_user)
    print("Users seeded.")
    
    # 3. Seed Cities
    cities_data = [
        {
            "name": "Tokyo", "country": "Japan", "region": "Asia", "cost_index": 4, "popularity": 5,
            "description": "A futuristic city blending neon-lit skyscrapers with historic temples, shrines, and world-class culinary experiences.",
            "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600"
        },
        {
            "name": "Paris", "country": "France", "region": "Europe", "cost_index": 4, "popularity": 5,
            "description": "The City of Light is global hub for art, fashion, gastronomy, and culture, known for its historic monuments and romantic cafes.",
            "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600"
        },
        {
            "name": "Rome", "country": "Italy", "region": "Europe", "cost_index": 3, "popularity": 5,
            "description": "A sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture, and ruins on display.",
            "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600"
        },
        {
            "name": "New York", "country": "United States", "region": "North America", "cost_index": 5, "popularity": 5,
            "description": "The Big Apple, featuring Central Park, Broadway shows, world-famous skyscrapers, and diverse cultural neighborhoods.",
            "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600"
        },
        {
            "name": "Cairo", "country": "Egypt", "region": "Africa", "cost_index": 2, "popularity": 4,
            "description": "Egypt's sweeping capital, set on the Nile River, home to Giza pyramid complex, royal mummies, and ancient history.",
            "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600"
        },
        {
            "name": "Sydney", "country": "Australia", "region": "Oceania", "cost_index": 4, "popularity": 4,
            "description": "Australia's largest city, best known for its Sydney Opera House, beautiful harbour, surf beaches, and sunny weather.",
            "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600"
        },
        {
            "name": "Bangkok", "country": "Thailand", "region": "Asia", "cost_index": 2, "popularity": 5,
            "description": "Thailand's capital, known for ornate shrines, vibrant street life, historic canals, and legendary street food stalls.",
            "image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600"
        },
        {
            "name": "Rio de Janeiro", "country": "Brazil", "region": "South America", "cost_index": 3, "popularity": 4,
            "description": "A massive seaside city in Brazil, famous for its Copacabana and Ipanema beaches, Christ the Redeemer statue, and Carnival.",
            "image_url": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600"
        },
        {
            "name": "Cape Town", "country": "South Africa", "region": "Africa", "cost_index": 3, "popularity": 4,
            "description": "A port city on South Africa's southwest coast, on a peninsula beneath the imposing Table Mountain with harbor views.",
            "image_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600"
        },
        {
            "name": "Jaipur", "country": "India", "region": "Asia", "cost_index": 2, "popularity": 4,
            "description": "The capital of India's Rajasthan state, known as the 'Pink City' due to its trademark building color and royal palaces.",
            "image_url": "https://images.unsplash.com/photo-1477584322813-ac8f350c3f0b?w=600"
        }
    ]
    
    cities = []
    for city_info in cities_data:
        city = City(**city_info)
        db.add(city)
        cities.append(city)
    db.commit()
    
    for c in cities:
        db.refresh(c)
    
    print("Cities seeded.")
    
    # 4. Seed Predefined Activities
    activities_by_city = {
        "Tokyo": [
            {"title": "teamLab Planets Digital Art Museum", "description": "Immerse yourself in giant, interactive digital art exhibitions where you walk through water.", "category": "Sightseeing", "cost": 28.0, "duration_minutes": 120, "image_url": "https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?w=300"},
            {"title": "Tsukiji Outer Market Food Tour", "description": "Sample fresh sushi, wagyu beef, tamagoyaki, and Japanese tea in Tokyo's culinary center.", "category": "Food", "cost": 45.0, "duration_minutes": 180, "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300"},
            {"title": "Mount Fuji Day Trip & Lake Kawaguchiko", "description": "Full-day scenic tour to Mount Fuji's 5th station, scenic ropeway, and traditional villages.", "category": "Adventure", "cost": 85.0, "duration_minutes": 600, "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300"},
            {"title": "Shinjuku Izakaya & Alley Crawl", "description": "Discover hidden drinking alleys (Omoide Yokocho) and enjoy yakitori and beer with locals.", "category": "Food", "cost": 35.0, "duration_minutes": 150, "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300"}
        ],
        "Paris": [
            {"title": "Eiffel Tower Summit Access Tour", "description": "Skip-the-line guided access to the absolute top summit of the Eiffel Tower with champagne.", "category": "Sightseeing", "cost": 35.0, "duration_minutes": 120, "image_url": "https://images.unsplash.com/photo-1543349689-9a4d426bee87?w=300"},
            {"title": "Louvre Museum Masterpieces Guided Tour", "description": "See the Mona Lisa, Venus de Milo, and Winged Victory with an art historian guide.", "category": "Sightseeing", "cost": 40.0, "duration_minutes": 180, "image_url": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=300"},
            {"title": "Croissant & Baguette Baking Workshop", "description": "Learn the secrets of laminating dough and baking classic French pastries in a local bakery.", "category": "Food", "cost": 55.0, "duration_minutes": 150, "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"},
            {"title": "Seine River Dinner Cruise", "description": "Gourmet 3-course French dinner accompanied by live violin music as landmarks light up.", "category": "Food", "cost": 75.0, "duration_minutes": 150, "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300"}
        ],
        "Rome": [
            {"title": "Colosseum, Roman Forum & Palatine Hill Tour", "description": "Walk through the Gladiator's gate and explore the ruins of Rome's ancient empire center.", "category": "Sightseeing", "cost": 29.0, "duration_minutes": 180, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300"},
            {"title": "Handmade Pasta & Tiramisu Masterclass", "description": "Roll fresh fettuccine and whip up traditional Italian tiramisu inside a Roman piazza cellar.", "category": "Food", "cost": 49.0, "duration_minutes": 180, "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300"},
            {"title": "Vatican Museums & Sistine Chapel Tour", "description": "Marvel at Michelangelo's ceilings and explore vast Papal art collections with fast-track entry.", "category": "Sightseeing", "cost": 38.0, "duration_minutes": 240, "image_url": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=300"}
        ],
        "New York": [
            {"title": "Summit One Vanderbilt Observation Deck", "description": "Experience multi-sensory art installations and panoramic views of Manhattan from glass ledges.", "category": "Sightseeing", "cost": 42.0, "duration_minutes": 90, "image_url": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300"},
            {"title": "Broadway Musical: The Lion King", "description": "Award-winning theatrical production filled with incredible animal costumes and classic songs.", "category": "Sightseeing", "cost": 110.0, "duration_minutes": 150, "image_url": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300"},
            {"title": "Central Park Guided Bike Tour", "description": "Cycle past Bethesda Fountain, Strawberry Fields, Belvedere Castle, and historic film locations.", "category": "Adventure", "cost": 35.0, "duration_minutes": 120, "image_url": "https://images.unsplash.com/photo-1518235506717-e1edb111a29b?w=300"},
            {"title": "Brooklyn Bridge & DUMBO Walking Tour", "description": "Walk the historic suspension bridge and capture the iconic Manhattan skyline views in Brooklyn.", "category": "Sightseeing", "cost": 15.0, "duration_minutes": 120, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300"}
        ],
        "Cairo": [
            {"title": "Giza Pyramids, Sphinx, & Camel Ride", "description": "Explore the oldest of the Seven Wonders of the Ancient World and ride a camel in the Sahara.", "category": "Adventure", "cost": 39.0, "duration_minutes": 300, "image_url": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=300"},
            {"title": "Grand Egyptian Museum Guided Tour", "description": "See King Tut's gold treasures and thousands of artifacts in Cairo's ultra-modern museum.", "category": "Sightseeing", "cost": 25.0, "duration_minutes": 180, "image_url": "https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=300"},
            {"title": "Khan El-Khalili Bazaar Market Shopping Tour", "description": "Bargain for spices, handmade copper lanterns, and silver jewelry in an ancient market maze.", "category": "Shopping", "cost": 12.0, "duration_minutes": 150, "image_url": "https://images.unsplash.com/photo-1545641203-7d072a14e3b2?w=300"}
        ],
        "Sydney": [
            {"title": "Sydney Opera House Behind-the-Scenes", "description": "Access dressing rooms and rehearsal spaces in this architectural icon, followed by dining.", "category": "Sightseeing", "cost": 32.0, "duration_minutes": 90, "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300"},
            {"title": "Bondi Beach Surf Lesson for Beginners", "description": "Catch your first wave on Sydney's world-famous surf beach with professional lifeguards.", "category": "Adventure", "cost": 52.0, "duration_minutes": 120, "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300"},
            {"title": "Sydney Harbour Bridge Climb at Twilight", "description": "Scale the arches of the Coathanger bridge for breathtaking sunset views of the Opera House.", "category": "Adventure", "cost": 210.0, "duration_minutes": 210, "image_url": "https://images.unsplash.com/photo-1524820197278-540916411e20?w=300"}
        ]
    }
    
    for city_name, act_list in activities_by_city.items():
        city_obj = next((c for c in cities if c.name == city_name), None)
        if city_obj:
            for act_info in act_list:
                pre_act = PredefinedActivity(city_id=city_obj.id, **act_info)
                db.add(pre_act)
    db.commit()
    print("Predefined activities seeded.")
    
    # 5. Seed alice's Sample Trip
    paris_obj = next(c for c in cities if c.name == "Paris")
    rome_obj = next(c for c in cities if c.name == "Rome")
    
    alice_trip = Trip(
        user_id=regular_user.id,
        name="Romantic European Summer",
        start_date=date.today() + timedelta(days=10),
        end_date=date.today() + timedelta(days=20),
        description="A beautiful 10-day trip exploring the history, art, and delicious foods of Paris and Rome.",
        cover_photo="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
        is_public=True,
        share_token=secrets.token_urlsafe(12),
        total_budget=2000.0
    )
    db.add(alice_trip)
    db.commit()
    db.refresh(alice_trip)
    
    # Add stops
    stop1 = Stop(
        trip_id=alice_trip.id,
        city_id=paris_obj.id,
        arrival_date=alice_trip.start_date,
        departure_date=alice_trip.start_date + timedelta(days=5),
        order_index=0
    )
    stop2 = Stop(
        trip_id=alice_trip.id,
        city_id=rome_obj.id,
        arrival_date=alice_trip.start_date + timedelta(days=5),
        departure_date=alice_trip.end_date,
        order_index=1
    )
    db.add(stop1)
    db.add(stop2)
    db.commit()
    db.refresh(stop1)
    db.refresh(stop2)
    
    # Add activities to stop 1 (Paris)
    act1 = Activity(
        stop_id=stop1.id,
        title="Eiffel Tower Summit Tour",
        description="Pre-booked guided tour with elevator pass to the top summit.",
        category="Sightseeing",
        cost=35.0,
        start_time="10:00",
        duration_minutes=120,
        order_index=0
    )
    act2 = Activity(
        stop_id=stop1.id,
        title="Croissant Baking Masterclass",
        description="Learning to roll and bake traditional buttery croissants.",
        category="Food",
        cost=55.0,
        start_time="14:00",
        duration_minutes=150,
        order_index=1
    )
    act3 = Activity(
        stop_id=stop1.id,
        title="Luxury Boutique Hotel Stay (5 Nights)",
        description="Cosy accommodation in Saint-Germain-des-Prés.",
        category="Accommodation",
        cost=600.0,
        start_time="15:00",
        duration_minutes=60,
        order_index=2
    )
    
    # Add activities to stop 2 (Rome)
    act4 = Activity(
        stop_id=stop2.id,
        title="Colosseum & Roman Forum Excursion",
        description="Historical exploration of Ancient Rome.",
        category="Sightseeing",
        cost=29.0,
        start_time="09:00",
        duration_minutes=180,
        order_index=0
    )
    act5 = Activity(
        stop_id=stop2.id,
        title="Handmade Pasta Dinner Class",
        description="Fettuccine cooking workshop followed by dinner.",
        category="Food",
        cost=49.0,
        start_time="18:30",
        duration_minutes=180,
        order_index=1
    )
    act6 = Activity(
        stop_id=stop2.id,
        title="Boutique Inn near Trevi (5 Nights)",
        description="Charming room in the historic center.",
        category="Accommodation",
        cost=500.0,
        start_time="15:00",
        duration_minutes=60,
        order_index=2
    )
    act7 = Activity(
        stop_id=stop2.id,
        title="Express Train Paris to Rome",
        description="High speed international rail ticket.",
        category="Transit",
        cost=120.0,
        start_time="07:30",
        duration_minutes=420,
        order_index=3
    )
    
    db.add_all([act1, act2, act3, act4, act5, act6, act7])
    db.commit()
    print("Alice's sample trip stops and activities seeded successfully.")
    
    # Seed Alice's Saved Destinations
    tokyo_obj = next(c for c in cities if c.name == "Tokyo")
    saved1 = SavedDestination(user_id=regular_user.id, city_id=tokyo_obj.id)
    saved2 = SavedDestination(user_id=regular_user.id, city_id=paris_obj.id)
    db.add_all([saved1, saved2])
    db.commit()
    print("Alice's saved destinations seeded.")

    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_data()
