# Add this at the top of the create_user_with_company function
from app.core.security import get_password_hash

# Then replace this line:
#   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#   hashed_password = pwd_context.hash(password)
# 
# With this:
#   hashed_password = get_password_hash(password)
