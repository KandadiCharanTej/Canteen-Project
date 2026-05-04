import database, models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
models.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()

# Clear existing to re-seed with images
db.query(models.Menu).delete()
db.query(models.User).delete()
db.query(models.TimeSlot).delete()

# Users
admin = models.User(name="Canteen Manager", contact="admin", role="admin", hashed_password=pwd_context.hash("admin123"))
student = models.User(name="Charan Tej", contact="9999999999", role="student", hashed_password=pwd_context.hash("user123"))
db.add(admin)
db.add(student)

# Menu Items
items = [
    {
        "name": "Hyderabadi Veg Biryani", 
        "category": "Main Course", 
        "price": 120, 
        "veg_flag": True, 
        "available_quantity": 25,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400&h=400&fit=crop"
    },
    {
        "name": "Chicken Dum Biryani", 
        "category": "Main Course", 
        "price": 180, 
        "veg_flag": False, 
        "available_quantity": 5,
        "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop"
    },
    {
        "name": "Paneer Butter Masala", 
        "category": "Main Course", 
        "price": 150, 
        "veg_flag": True, 
        "available_quantity": 15,
        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop"
    },
    {
        "name": "Crispy Veg Samosa", 
        "category": "Snacks", 
        "price": 20, 
        "veg_flag": True, 
        "available_quantity": 50,
        "image_url": "https://images.unsplash.com/photo-1601050633647-81a35d377aef?w=400&h=400&fit=crop"
    },
    {
        "name": "Masala Dosa", 
        "category": "Snacks", 
        "price": 60, 
        "veg_flag": True, 
        "available_quantity": 30,
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=400&fit=crop"
    },
    {
        "name": "Classic Cold Coffee", 
        "category": "Drinks", 
        "price": 45, 
        "veg_flag": True, 
        "available_quantity": 20,
        "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop"
    },
    {
        "name": "Gulab Jamun (2pcs)", 
        "category": "Desserts", 
        "price": 40, 
        "veg_flag": True, 
        "available_quantity": 15,
        "image_url": "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=400&fit=crop"
    },
    {
        "name": "Mango Lassi", 
        "category": "Drinks", 
        "price": 50, 
        "veg_flag": True, 
        "available_quantity": 0,
        "image_url": "https://images.unsplash.com/photo-1571006682881-2c069137d45e?w=400&h=400&fit=crop"
    }
]

for i in items:
    db.add(models.Menu(**i))

# Time Slots
times = ['10:00 AM','10:15 AM','10:30 AM','10:45 AM','11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '1:00 PM']
for t in times:
    db.add(models.TimeSlot(slot_time=t, max_orders=20, current_orders=0))

db.commit()
db.close()
print("Database re-seeded with premium images!")
