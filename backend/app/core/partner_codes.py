"""
Partner code generation using numeric-only encoding
"""

PRIME_MULTIPLIER = 10007

def generate_partner_code(user_id: int) -> str:
    """Generate numeric partner code from user ID"""
    encoded = user_id * PRIME_MULTIPLIER
    return f"PA{encoded}"

def decode_partner_code(partner_code: str) -> int:
    """Decode partner code to user ID. Returns None if invalid"""
    try:
        if not partner_code.startswith("PA"):
            return None
        
        encoded = int(partner_code.replace("PA", ""))
        user_id = encoded // PRIME_MULTIPLIER
        
        # Verify it decodes correctly
        if user_id * PRIME_MULTIPLIER == encoded:
            return user_id
        return None
    except:
        return None
