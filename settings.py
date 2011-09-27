"""=============================================================================
    Settings.py
    ------------
    Handle django settings.  Imports from settings_config.py, which contains 
    local server specific settings
============================================================================="""
import os
import sys
import settings_config

"""--------------------------------------------------------------------------
    Enviornment Specific Settings
-----------------------------------------------------------------------------"""
#Debug settings.  Should never be set to True in production or staging
DEBUG = settings_config.DEBUG
HIDDEN_SETTINGS = True 
TEMPLATE_DEBUG = DEBUG

ENVIRONMENT_TYPES = ['dev', 'production']
SITE_ENVIRONMENT = settings_config.SITE_ENVIRONMENT

#Double check that debug is always false if in production
#if SITE_ENVIRONMENT == ENVIRONMENT_TYPES[1]:
#    DEBUG = False

#Path Of vasir folder
#------------
ROOT_PATH = os.path.realpath(os.path.dirname(__file__))

#APACHE URL - Used for urls.py prefix.  Usually will be ''
try:
    URL_PREFIX = settings_config.URL_PREFIX
except AttributeError:
    URL_PREFIX = ''

"""--------------------------------------------------------------------------
    
    Django Database Settings

-----------------------------------------------------------------------------"""
#See if we should force sqlite use
try:
    FORCE_SQLITE = settings_config.FORCE_SQLITE
except AttributeError:
    FORCE_SQLITE = False

try:
    FORCE_POSTGRES = settings_config.FORCE_POSTGRES
except AttributeError:
    FORCE_POSTGRES = False

#Use local sqlite db if in dev, otherwise use postgres
if (SITE_ENVIRONMENT == 'dev' or FORCE_SQLITE is True) and (FORCE_POSTGRES is False):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'vasirinterface.db',
            'USER': '',
            'PASSWORD': '',
            'HOST': '',
            'PORT': '',
        }
    }
elif SITE_ENVIRONMENT == 'production' or FORCE_POSTGRES is True:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'vasirinterface',
            'USER': 'postgres',
            'PASSWORD': settings_config.PRODUCTION_PASSWORD,
            'HOST': 'localhost',
            'PORT': '',
        }
    }

"""--------------------------------------------------------------------------
    Admins
-----------------------------------------------------------------------------"""
try:
    ADMINS =  settings_config.ADMINS
except AttributeError:
    ADMINS = ()

MANAGERS = ADMINS

"""--------------------------------------------------------------------------
    
    Email Settings

-----------------------------------------------------------------------------"""
#Email Settings
EMAIL_HOST = settings_config.EMAIL_HOST
EMAIL_HOST_USER = settings_config.EMAIL_HOST_USER
EMAIL_HOST_PASSWORD = settings_config.EMAIL_HOST_PASSWORD
EMAIL_PORT = settings_config.EMAIL_PORT
EMAIL_USE_TLS = settings_config.EMAIL_USE_TLS

"""--------------------------------------------------------------------------
    
    Other django settings

-----------------------------------------------------------------------------"""
MEDIA_URL = getattr(settings_config, 'MEDIA_URL', '')
MEDIA_ROOT = os.path.join(ROOT_PATH, 'data/www')

SITE_ID = 1

TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'

USE_I18N = True
USE_L10N = True

STATIC_ROOT = ''
STATIC_URL = '/static/'

ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    os.path.join(ROOT_PATH, "data/www"),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '$n-3jw&-vfxn)@@-w-xcze1m!@fqsc0zvba-s8p)dc*&2sulz@'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'VasirInteraction.urls'

TEMPLATE_DIRS = (
    os.path.join(ROOT_PATH, "data/templates"),
)

FIXTURE_DIRS = (
    os.path.join(ROOT_PATH, 'data/fixtures/'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'VasirInteraction.engine',
    # Uncomment the next line to enable the admin:
    # 'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
