"""
Initialize database tables
"""
import sys
sys.path.insert(0, '/app')

from app.core.database import system_engine as engine, Base
from app.models import Tenant, User, Subscription, Content

def init_db():
    """Create all tables"""
    print("Creating system database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    
    # Show created tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("\nCreated tables:")
    for table in tables:
        print(f"- {table}")

if __name__ == "__main__":
    init_db()
