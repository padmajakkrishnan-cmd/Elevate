import firebase_admin
from firebase_admin import credentials, auth
from backend.config import settings

# Initialize Firebase Admin SDK
# For development, you can use the project ID directly
# For production, use a service account key file

if not firebase_admin._apps:
    # Try to initialize with service account credentials from settings
    if settings.firebase_private_key and settings.firebase_client_email:
        # Replace escaped newlines in private key
        firebase_private_key = settings.firebase_private_key.replace('\\n', '\n')
        
        # Create credentials from settings
        cred_dict = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": firebase_private_key,
            "client_email": settings.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    else:
        # Fallback: Initialize with project ID only (limited functionality)
        # This will work for some operations but may fail for token verification
        firebase_admin.initialize_app(options={
            'projectId': settings.firebase_project_id
        })

def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded token.
    
    Args:
        id_token: The Firebase ID token to verify
        
    Returns:
        dict: Decoded token containing user information
        
    Raises:
        firebase_admin.auth.InvalidIdTokenError: If token is invalid
        firebase_admin.auth.ExpiredIdTokenError: If token is expired
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise e