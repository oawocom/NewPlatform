"""
Create system database tables
Run this once to initialize the database
"""
from app.core.database import system_engine, Base
from app.models import Tenant, User, Subscription

def create_tables():
    print("Creating system database tables...")
    Base.metadata.create_all(bind=system_engine)
    print("✅ Tables created successfully!")
    print("\nCreated tables:")
    print("- tenants")
    print("- users")
    print("- subscriptions")

if __name__ == "__main__":
    create_tables()
