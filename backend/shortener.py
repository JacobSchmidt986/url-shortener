import secrets
import string

#Characters allowed in shortened URLS
CHARACTERS = string.ascii_letters + string.digits

#Length of generated short code
CODE_LENGTH = 6

def generate_code():
    # Generate a random 6 character code
    return "".join(
        secrets.choice(CHARACTERS)
        for _ in range(CODE_LENGTH)
    )