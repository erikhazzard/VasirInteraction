'''========================================================================

    Imports

    ======================================================================='''
from views_util import * 

'''========================================================================

    View Functions

    ======================================================================='''
'''========================================================================
    Base Pages
    ======================================================================='''
@render_to('engine/home.html')
def page_home(request):
    '''page_home(request):
    ----------------------
    Renders the base page which provides access to interaction functions
    below'''
    return {}

'''========================================================================
    VasirEngine Interactions
    ======================================================================='''
#----------------------------------------
#Send message to ZeroMQ
#----------------------------------------
@csrf_exempt
def send_message(request, message=''):
    '''Uses ZeroMQ to send a message to the engine's server to get ALL 
    entities in the current game state'''

    print 'Message: %s' % (message)

    #Get a socket and context
    socket, context = create_zmq_req_socket_context()

    #Send a message to the server to create an entity
    socket.send_unicode(message)
    
    #Get the response
    zmq_response = socket.recv()

    #Close the socket and end the context
    socket.close()
    context.term()

    #Return the zmq response string
    return JsonResponse(zmq_response)

#----------------------------------------
#Get Entity Info
#----------------------------------------
@csrf_exempt
def get_entity_info(request, entity_id):
    '''Generates a message and calls send_message'''

    message = 'get_info_%s' % (entity_id)

    #Return the zmq response string
    return send_message(request, message)

#----------------------------------------
#set entity target
#----------------------------------------
@csrf_exempt
def set_entity_target(request, source_entity_id, target_entity_id):
    '''generates a message and calls send_message'''

    #set message, looks like set_target_entity1,entity2
    message = 'set_target_%s,%s' % (
        source_entity_id,
        target_entity_id,)

    #return the zmq response string
    return send_message(request, message)

#----------------------------------------
#converse
#----------------------------------------
@csrf_exempt
def converse(request, source_entity_id):
    '''generates a message and calls send_message'''

    #set message, looks like set_target_entity1,entity2
    message = 'converse_%s' % (
        source_entity_id) 

    #return the zmq response string
    return send_message(request, message)

