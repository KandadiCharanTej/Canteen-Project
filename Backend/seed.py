import database, models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
models.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()

# Clear existing to re-seed
db.query(models.OrderItem).delete()
db.query(models.Order).delete()
db.query(models.Menu).delete()
db.query(models.User).delete()
db.query(models.TimeSlot).delete()

# ─── Users ───
admin = models.User(
    name="Canteen Manager", contact="admin", role="admin",
    category="Admin", hashed_password=pwd_context.hash("admin123")
)
admin2 = models.User(
    name="Kitchen Head", contact="admin2", role="admin",
    category="Admin", hashed_password=pwd_context.hash("admin123")
)
student = models.User(
    name="Charan Tej", contact="9999999999", role="student",
    category="Student", student_class="CSE-A 2nd Year",
    hashed_password=pwd_context.hash("user123")
)
lecturer = models.User(
    name="Dr. Ramesh", contact="8888888888", role="student",
    category="Lecturer", hashed_password=pwd_context.hash("user123")
)

db.add_all([admin, admin2, student, lecturer])

# ─── Menu Items ───
items = [
    {
        "name": "Hyderabadi Veg Biryani",
        "category": "Main Course",
        "price": 120,
        "veg_flag": True,
        "available_quantity": 25,
        "description": "Fragrant basmati rice with mixed vegetables and aromatic spices",
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400&h=400&fit=crop",
        "is_best": True,
    },
    {
        "name": "Chicken Dum Biryani",
        "category": "Main Course",
        "price": 180,
        "veg_flag": False,
        "available_quantity": 5,
        "description": "Slow-cooked chicken biryani with saffron and whole spices",
        "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop",
        "is_best": True,
    },
    {
        "name": "Paneer Butter Masala",
        "category": "Main Course",
        "price": 150,
        "veg_flag": True,
        "available_quantity": 15,
        "description": "Creamy tomato-based curry with soft paneer cubes",
        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop",
        "is_best": True,
    },
    {
        "name": "Butter Chicken",
        "category": "Main Course",
        "price": 170,
        "veg_flag": False,
        "available_quantity": 12,
        "description": "Tender chicken in rich, creamy tomato sauce",
        "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop",
        "is_best": True,
    },
    {
        "name": "Crispy Veg Samosa",
        "category": "Snacks",
        "price": 20,
        "veg_flag": True,
        "available_quantity": 50,
        "description": "Golden fried pastry filled with spiced potatoes and peas",
        "image_url": "https://images.unsplash.com/photo-1601050633647-81a35d377aef?w=400&h=400&fit=crop",
    },
    {
        "name": "Masala Dosa",
        "category": "South Indian",
        "price": 60,
        "veg_flag": True,
        "available_quantity": 30,
        "description": "Crispy rice crepe filled with spiced potato filling",
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=400&fit=crop",
        "is_best": True,
    },
    {
        "name": "Idli Sambar",
        "category": "South Indian",
        "price": 40,
        "veg_flag": True,
        "available_quantity": 35,
        "description": "Soft steamed rice cakes with lentil soup and chutneys",
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=400&fit=crop",
    },
    {
        "name": "Classic Cold Coffee",
        "category": "Beverages",
        "price": 45,
        "veg_flag": True,
        "available_quantity": 20,
        "description": "Chilled blend of coffee, milk and ice cream",
        "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop",
    },
    {
        "name": "Mango Lassi",
        "category": "Beverages",
        "price": 50,
        "veg_flag": True,
        "available_quantity": 0,
        "description": "Creamy yogurt smoothie with fresh mango pulp",
        "image_url": "https://images.unsplash.com/photo-1571006682881-2c069137d45e?w=400&h=400&fit=crop",
    },
    {
        "name": "Masala Chai",
        "category": "Beverages",
        "price": 15,
        "veg_flag": True,
        "available_quantity": 100,
        "description": "Traditional Indian spiced tea with ginger and cardamom",
        "image_url": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop",
    },
    {
        "name": "Gulab Jamun (2pcs)",
        "category": "Desserts",
        "price": 40,
        "veg_flag": True,
        "available_quantity": 15,
        "description": "Deep-fried milk solids soaked in rose-flavored sugar syrup",
        "image_url": "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=400&fit=crop",
    },
    {
        "name": "Chole Bhature",
        "category": "Main Course",
        "price": 90,
        "veg_flag": True,
        "available_quantity": 20,
        "description": "Spicy chickpea curry with deep-fried bread",
        "image_url": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&h=400&fit=crop",
    },
    {
        "name": "Veg Sandwich",
        "category": "Snacks",
        "price": 40,
        "veg_flag": True,
        "available_quantity": 25,
        "description": "Grilled sandwich with fresh vegetables and cheese",
        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    },
    {
        "name": "French Fries",
        "category": "Snacks",
        "price": 50,
        "veg_flag": True,
        "available_quantity": 40,
        "description": "Crispy golden fries with ketchup and seasoning",
        "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop",
    },
    {
        "name": "Chocolate Brownie",
        "category": "Desserts",
        "price": 55,
        "veg_flag": True,
        "available_quantity": 10,
        "description": "Rich, fudgy chocolate brownie with walnuts",
        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
        "is_best": True,
    },
]

for i in items:
    db.add(models.Menu(**i))

# ─── Time Slots (5-minute intervals) ───
times = []
for hour in range(10, 15):  # 10 AM to 2 PM
    for minute in range(0, 60, 5):
        h = hour if hour <= 12 else hour - 12
        period = "AM" if hour < 12 else "PM"
        if hour == 12:
            h = 12
        times.append(f"{h}:{minute:02d} {period}")

for t in times:
    db.add(models.TimeSlot(slot_time=t, max_orders=25, current_orders=0))

db.commit()
db.close()
print(f"[OK] Database seeded successfully!")
print(f"   - {len(items)} menu items")
print(f"   - {len(times)} time slots (5-min intervals)")
print(f"   - Admin: admin / admin123")
print(f"   - Student: 9999999999 / user123")
