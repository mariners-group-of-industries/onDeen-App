import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from app.utils.custom_exception import ServiceError
from app.repositories.user import user
from app.repositories.membership import MembershipRepository
from jwt.algorithms import RSAAlgorithm
import jwt
import os
import base64
import json



class SocialService:
    
    @staticmethod
    def verify_google_token(id_token_str):
        """
        Verify the user's Google ID token and return the decoded information.
        :param id_token_str: str - The ID token received from Google login
        :return: dict - Decoded ID token data
        :raises: ServiceError - if the token verification fails
        """

        client_ids = [
            value.strip()
            for value in os.getenv('GOOGLE_OAUTH_CLIENT_IDS', '').split(',')
            if value.strip()
        ]
        for env_key in ('GOOGLE_ANDROID_CLIENT_ID', 'GOOGLE_IOS_CLIENT_ID', 'GOOGLE_WEB_CLIENT_ID'):
            if os.getenv(env_key):
                client_ids.append(os.getenv(env_key))

        if not client_ids:
            raise ServiceError('Google OAuth client IDs are not configured')
        
        try:
            # Verify the token
            id_info = id_token.verify_oauth2_token(id_token_str, google_requests.Request())
            
            # Check if the audience matches either Android or iOS CLIENT_ID
            if id_info['aud'] not in client_ids:
                raise ServiceError(f"Token has wrong audience: {id_info['aud']}")
            
            return id_info
        
        except ValueError as e:
            raise ServiceError(f'Invalid token {e}')
    
    @staticmethod
    def extract_user_data(id_info, provider, id_token_str):

        """
        Extract user profile information from the decoded Google ID token.
        :param id_info: dict - The decoded ID token information
        :param provider: str - The provider name (e.g., 'google')
        :param id_token_str: str - The ID token received from Google login
        :return: dict - User profile data or registration status
        """
        # Extract user profile data
        user_data = {
            'social_id': id_info['sub'],  # 'sub' is the unique Google ID for the user
            'first_name': id_info.get('given_name'),
            'last_name': id_info.get('family_name'),
            'email_id': id_info.get('email'),
            'profile_image': id_info.get('picture'),
            'provider': provider,

            'social_access_token': id_token_str
        }
        
        if user_data['social_id'] is not None:
            # Check if the user is already registered using the social ID
            social_data = user.check_social_id(user_data['social_id'], provider, 2)
            
            if social_data is not None:
                response_data = SocialService.get_response_data(social_data.user_id)
            
                return response_data
            else:
                email = user.email_check(user_data['email_id'],2)
                if email is not None:
                    user.add_user_by_social_id(user_data['social_id'],user_data['social_access_token'],user_data['provider'],email.id)
                    response_data = SocialService.get_response_data(email.id)
                    return response_data  
        
            return user_data
    
    @staticmethod
    def google_user_profile(id_token_str, provider):
        """
        Verify and decode the user's ID token to fetch the profile data from Google.
        :param id_token_str: str - The ID token received from Google login
        :param provider: str - The provider name (e.g., 'google')
        :return: dict - User profile information from Google
        :raises: ServiceError - if the token verification fails
        """
        # Step 1: Verify the token and get the decoded information
        id_info = SocialService.verify_google_token(id_token_str)
        
        # Step 2: Extract user data based on the decoded token
        return SocialService.extract_user_data(id_info, provider, id_token_str)
    
    
    
    @staticmethod
    def google_user_profile2(id_info, provider):
        """
        Verify and decode the user's ID token to fetch the profile data from Google.
        :param id_token_str: str - The ID token received from Google login
        :param provider: str - The provider name (e.g., 'google')
        :return: dict - User profile information from Google
        :raises: ServiceError - if the token verification fails
        """
        if id_info.get('sub'):
            if not id_info.get('access_token'):
                id_info['access_token']=id_info.get('sub')
            return SocialService.extract_user_data(id_info, provider, id_info.get('access_token'))
        
        raise ServiceError("sub required")
    
    
    
    FacebookFIELDS = 'id,first_name,last_name,email,picture'

    @staticmethod
    def facebook_user_profile(access_token,provider):
        """
        Fetch the user's profile data from Facebook Graph API using the access token.
        :param access_token: str - The OAuth access token received from Facebook login
        :return: dict - User profile information from Facebook
        :raises: ServiceError - if the request fails
        """
        params = {
            'fields': SocialService.FacebookFIELDS,
            'access_token': access_token
        }

       
        response = requests.get(os.getenv('GRAPH_API_URL'), params=params)
        response_data = response.json()

        if response.status_code != 200:
            raise ServiceError(f"Failed to fetch user profile from Facebook: {response_data.get('error', {}).get('message')}")

        # Extracting required fields
        user_data = {
            'id': response_data.get('id'),
            'first_name': response_data.get('first_name'),
            'last_name': response_data.get('last_name'),
            'email': response_data.get('email'),
            'profile_image': response_data.get('picture', {}).get('data', {}).get('url')
        }
        return user_data
    
    
    
    
    @staticmethod
    def get_apple_public_key(kid):
        """
        Fetch and cache the Apple public keys for validating the ID token.
        :param kid: str - The key ID to select the correct public key
        :return: public_key
        """
        apple_keys = requests.get(os.getenv('APPLE_KEYS_URL')).json()
        for key in apple_keys['keys']:
            if key['kid'] == kid:
                public_key = RSAAlgorithm.from_jwk(key)
                return public_key
        raise ServiceError("Public key not found for Apple ID token.")
    
    @staticmethod
    def verify_apple_id_token(id_token_str):
        """
        Verify and decode the user's Apple ID token.
        :param id_token_str: str - The ID token received from Apple login
        :return: dict - Decoded user information from Apple ID token
        :raises: ServiceError - if the token verification fails
        """
        header = jwt.get_unverified_header(id_token_str)
        public_key = SocialService.get_apple_public_key(header['kid'])

        try:
            decoded_token = jwt.decode(
                id_token_str,
                key=public_key,
                algorithms=['RS256'],
                audience=os.getenv('APPLE_CLIENT_ID'),
                options={"verify_exp": True}
            )
            return decoded_token
        except jwt.ExpiredSignatureError:
            raise ServiceError("Apple ID token has expired.")
        except jwt.InvalidTokenError:
            raise ServiceError("Invalid Apple ID token.")
    
    
    
    @staticmethod
    def apple_user_profile(social_token, provider):
            
        # Assuming 'self.social_token' in Python is like an object attribute
        social_token = social_token # Replace this with the actual token

        # Split the token by '.' and take the second part
        apple = social_token.split('.')[1]

        # Decode the base64 string and parse it as JSON
        id_info = json.loads(base64.b64decode(apple + "==").decode("utf-8"))
        
        user_data = {
            'social_id': id_info['sub'],  # 'sub' is the unique Google ID for the user
            'email_id': id_info.get('email'),
            'social_access_token': social_token
        }
        
        if user_data['social_id'] is not None:
            social_data = user.check_social_id(user_data['social_id'], provider, 2)
            
            if social_data is not None:
                profile = user.get_userby_id(social_data.user_id)
                token = user.generate_token(profile, profile.role_type, auth_method="social")
                
                response_data = {
                    'is_register': True,
                    'access_token': token,
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'mobile_number': profile.mobile_number,
                    'country_code': profile.country_code,
                    'gender': profile.gender,
                    'email_id': profile.email_id,
                    'profile_image': profile.profile_image
                }
                return response_data
        

        return user_data
    



    @staticmethod
    def get_response_data(user_id):

        profile = user.get_userby_id(user_id)
        if profile.status==1:
            access_token = user.generate_token(profile, profile.role_type, auth_method="social")
            active_membership_count = MembershipRepository.get_my_active_membership_count(user_id)          
                        # Return the registered user's profile data
            response_data = {
                'is_register': True,
                'access_token': access_token,
                'active_membership_count': active_membership_count,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'mobile_number': profile.mobile_number,
                'country_code': profile.country_code,
                'gender': profile.gender,
                'email_id': profile.email_id,
                'profile_image': profile.profile_image
            }
        else:
            raise ServiceError('Your account has been deactivated')
        
        return response_data

        
