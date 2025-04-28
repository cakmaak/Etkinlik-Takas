from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from firebase_admin import auth

User = get_user_model()

class FirebaseAuthenticationBackend(ModelBackend):
    def authenticate(self, request, token=None):
        if not token:
            return None

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            try:
                user = User.objects.get(username=uid)
                return user
            except User.DoesNotExist:
                email = decoded_token.get('email', '')
                name = decoded_token.get('name', '')
                
                user = User.objects.create(
                    username=uid,
                    email=email,
                    first_name=name
                )
                return user
                
        except Exception as e:
            print(f"Firebase authentication error: {e}")
            return None 