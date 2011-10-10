"""=============================================================================
    settings_config.py
    -------------------
    Local, server specific settings
============================================================================="""

"""--------------------------------------------------------------------------
    Enviornment Specific Settings
-----------------------------------------------------------------------------"""
DEBUG = True
SITE_ENVIRONMENT = 'dev'
HOST_NAME = 'localhost'

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)
"""--------------------------------------------------------------------------
    Cache Settings
-----------------------------------------------------------------------------"""
#If we wanted to force memcache use, we could here
#FORCE_MEMCACHED = True

"""--------------------------------------------------------------------------
    Database Settings
-----------------------------------------------------------------------------"""
FORCE_SQLITE = True
#PRODUCTION_PASSWORD = 'my_password'

"""--------------------------------------------------------------------------
    
    Email Settings

-----------------------------------------------------------------------------"""
#Email Settings
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'vasirdev@gmail.com'
EMAIL_HOST_PASSWORD = ''
EMAIL_PORT = 587
EMAIL_USE_TLS = True

"""--------------------------------------------------------------------------
    
    Other Django Settings

-----------------------------------------------------------------------------"""
#Session Age, in seconds
#Long time for dev, set small for production
SESSION_COOKIE_AGE = 18000 
SITE_ID = 1
