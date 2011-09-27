import os
import sys
sys.path.append('/home/erik/Code/')
sys.path.append('/home/erik/Code/VasirInteraction')

os.environ['DJANGO_SETTINGS_MODULE'] = 'VasirInteraction.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
