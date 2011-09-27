'''========================================================================

    Imports

    ======================================================================='''
#ZeroMQ Imports
import zmq

#Other python imports
import simplejson
import math
import random

#Django Imports
from django.shortcuts import *
from django.http import HttpResponseRedirect, HttpResponse
from django.template import RequestContext
from django.core.mail import EmailMessage, SMTPConnection, send_mail
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_page

import django.db.models
from django.conf import settings

'''========================================================================

    Utility Functions

    ======================================================================='''
'''========================================================================
    ZeroMQ Related
    ======================================================================='''
#----------------------------------------
#Create socket utility function
#----------------------------------------
def create_zmq_req_socket_context(port='5000'):
    #Create a ZMQ context, create a REQ socket and bind it to localhost
    context = zmq.Context()
    socket = context.socket(zmq.REQ)
    socket.connect('tcp://127.0.0.1:5000')
    return socket, context

'''========================================================================
    Django Related
    ======================================================================='''
#---------------------------------------
#render_to_response shortcut
#---------------------------------------
try:
    from functools import wraps
except ImportError: 
    def wraps(wrapped, assigned=('__module__', '__name__', '__doc__'),
              updated=('__dict__',)):
        def inner(wrapper):
            for attr in assigned:
                setattr(wrapper, attr, getattr(wrapped, attr))
            for attr in updated:
                getattr(wrapper, attr).update(getattr(wrapped, attr, {}))
            return wrapper
        return inner

def render_to(template=None, mimetype=None):
    def renderer(function):
        @wraps(function)
        def wrapper(request, *args, **kwargs):
            output = function(request, *args, **kwargs)
            if not isinstance(output, dict):
                return output
            tmpl = output.pop('TEMPLATE', template)
            return render_to_response(tmpl, output, \
                        context_instance=RequestContext(request), mimetype=mimetype)
        return wrapper
    return renderer

class JsonResponse(HttpResponse):
    """
    HttpResponse descendant, which return response with ``application/json`` mimetype.
    """
    def __init__(self, data):
        super(JsonResponse, self).__init__(content=simplejson.dumps(data), mimetype='application/json')

