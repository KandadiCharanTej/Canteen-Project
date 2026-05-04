import database, models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
models.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()

if not db.query(models.User).first():
    admin = models.User(name="Admin User", contact="admin", role="admin", hashed_password=pwd_context.hash("admin123"))
    student = models.User(name="Student User", contact="student", role="student", hashed_password=pwd_context.hash("student123"))
    db.add(admin)
    db.add(student)

if not db.query(models.Menu).first():
    items = [
        {"name": "Veg Biryani", "category": "Meals", "price": 60, "veg_flag": True, "available_quantity": 40},
        {"name": "Chicken Biryani", "category": "Meals", "price": 80, "veg_flag": False, "available_quantity": 30},
        {"name": "Masala Dosa", "category": "Meals", "price": 40, "veg_flag": True, "available_quantity": 50},
        {"name": "Samosa", "category": "Snacks", "price": 15, "veg_flag": True, "available_quantity": 80},
        {"name": "Cold Coffee", "category": "Beverages", "price": 30, "veg_flag": True, "available_quantity": 25},
    ]
    for i in items:
        db.add(models.Menu(**i))

db.commit()
db.close()
print("Database seeded!")
