/* ========================================================================    
 *
 * engine_interaction.js
 * ----------------------
 *
 *  Contains the main functions for interacting with the engine and page setup
 *
 * ======================================================================== */
//============================================================================
//Main App Object
//============================================================================
var VASIR_ENGINE = {
    '_HOST_NAME': document.domain,

    //Store reference to functions
    'functions': {
        //-----------------------------------
        //ENGINE Actions
        //-----------------------------------
        'add_entity': undefined,
        'get_game_state_request': undefined,

        //-----------------------------------
        //ENTITY Actions
        //-----------------------------------
        'get_entity_information': undefined,
        'set_entity_target': undefined,
        
        //-----------------------------------
        //Engine Log Actions
        //-----------------------------------
        'update_log': undefined,
        
        //-----------------------------------
        //Misc Actions
        //-----------------------------------
        'set_selected_entity': undefined,
        'update_game_state': undefined,

        //-----------------------------------
        //Init
        //-----------------------------------
        'init': undefined

    },

    //-----------------------------------
    //Engine State
    //-----------------------------------
    //Object containing all the entities in the engine
    'entities': {},

    //This application's currently selected entity (NOT the target of an entity)
    'selected_entity': undefined,

    //current 'selection' mode.  If set as 'entity_target', then clicking on an
    //  entity will set the current entity's target. If set as anything else
    //  (at least for now), anything else will just set the application's
    //  selected entity 
    'selection_mode': null

}

//============================================================================
//
//FUNCTIONS
//
//============================================================================
//============================================================================
//ENGINE RELATED
//============================================================================
//---------------------------------------
//add_entity():
//-------------
//  -Sends a request to the server to create an entity.  The server will
//      return a message if it was successful. If successful, update the
//      log and add the entity to the canvas (world)
//---------------------------------------
VASIR_ENGINE.functions.add_entity = function(){
    //Set up the request object and send it
    $.ajax({
        url: '/create_entity/',
        method: 'GET',
        dataType: 'json',
        beforeSend: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Sending request to create entity...',
                'style': 'waiting'});
        },
        success: function(res){
            res = eval(res);
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response
            //Update the engine log
            VASIR_ENGINE.functions.update_log({
                'message': 'Entity Created! ID: ' + res.entity_id,
                'style': 'success'});
            //Add entity to entity list
            VASIR_ENGINE.entities[res.entity_id] = {};

            //Set the currently selected entity to this entity
            VASIR_ENGINE.functions.set_selected_entity({
                'entity_id': res.entity_id
            });

            //Get the newly created entity's info. This also will
            //  add information about the entity stored in the 
            //  VASIR_ENGINE.entities object
            VASIR_ENGINE.functions.get_entity_information({
                'entity_id': res.entity_id,
                'callback': undefined
            });

            //Also, update the list of entities
            VASIR_ENGINE.functions.get_game_state_request();
        },
        error: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Error!: ' + res.message,
                'style': 'error'});
        }
    });
    return true;
}

//---------------------------------------
//TODO: Deprecated, this uses AJAX.  Instead we'll use Websockets
//get_game_state_request():
//-------------
//  -Sends a request to the server to get all the current entities.
//---------------------------------------
VASIR_ENGINE.functions.get_game_state_request = function(){
    $.ajax({
        url: '/get_entities/',
        method: 'GET',
        dataType: 'json',
        beforeSend: function(){
            VASIR_ENGINE.functions.update_log(
                {'message': 'Sending request to get all entities...',
                'style': 'waiting'});

        },
        success: function(res){
            VASIR_ENGINE.functions.update_game_state({
                game_state: eval(res),
                suppress_log: false
            });
        },
        error: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Error!: ' + res.message,
                'style': 'error'});
        }

    });
}

//---------------------------------------
//update_game_state(PARAMS({ game_state, suppress_log })):
//-------------
//  -Updates the game state based on the passed in JSON string
//---------------------------------------
VASIR_ENGINE.functions.update_game_state = function(params){
    //See if the game state obejct was passed in, or if an object containing
    //  game_state as a key was passed in
    if( typeof params === 'object' ){
        //Set the message and style
        var game_state = params.game_state;
        if(game_state === undefined){
            var game_state = params; 
        }

        //Check for suppress log
        var suppress_log = params.suppress_log;
        if(suppress_log === undefined){
            suppress_log = true;
        }
    }else if(typeof params === 'string'){
        var suppress_log = true;
        game_state = params
    }else{
        VASIR_ENGINE.functions.update_log({
            'message': 'Invalid game state response received',
            'style': 'error'});
        return false;
    }

    //decode the JSON response
    game_state = eval(game_state);
    game_state = game_state.game_state;
    
    if(game_state === undefined){
        return false;
    }

    //Update the engine log
    if(suppress_log === false){
        VASIR_ENGINE.functions.update_log({
            'message': game_state.entities.length + ' Entities Retrieved!',
            'style': 'success'});
    }
        

    //Loop through the returned entities and update the 
    //  VASIR_ENGINE.entities object
    for(var i=game_state.entities.length-1; i>=0; i--){
        //Add the entity info
        VASIR_ENGINE.entities[game_state.entities[i].id] = game_state.entities[i];
    }

    //If this current list of entities does not match the previous game
    //  state from the server, we need to generate a new list
    if(VASIR_ENGINE.WEB_SOCKET.previous_data.game_state){

        if(_.keys(VASIR_ENGINE.entities).length 
            !== VASIR_ENGINE.WEB_SOCKET.previous_data.game_state.entities.length){
            var list_element = {};

            //Clear out the existing elements
            $('#entities_list_ul').empty();

            for(var entity in VASIR_ENGINE.entities){
                if(VASIR_ENGINE.entities.hasOwnProperty(entity)){
                    list_element = $('<li/>', {
                        'id': 'entity_' + VASIR_ENGINE.entities[entity].id,
                    });

                    //Link (button)
                    list_element.append( $('<a/>', {
                        'href': '#',
                        'text': VASIR_ENGINE.entities[entity].id,
                        'class':'button',
                        'click': function(index, entity_id){
                            return function(){
                                //We need to use a closure here to maintain
                                //  state of the loop variable
                                //Perform an action based on the selection mode
                                if(VASIR_ENGINE.selection_mode === null){
                                    //select the entity they click on
                                    VASIR_ENGINE.functions.set_selected_entity(
                                        {'entity_id':entity_id});
                                }else if(VASIR_ENGINE.selection_mode ===
                                    'entity_target'){

                                    VASIR_ENGINE.functions.set_entity_target({
                                        'target_entity_id': entity_id 
                                    });
                                }
                            }}(entity, VASIR_ENGINE.entities[entity].id)
                    }));

                    //Add links to the entities list element
                    $('#entities_list_ul').append(list_element);
                }
            }
        }
    }

    //Update the entities list header
    $('#entities_list_header').innerHTML = 'All ' 
        + VASIR_ENGINE.entities.length + ' Entities';
}
//============================================================================
//ENTITY RELATED
//============================================================================
//---------------------------------------
//get_entity_information( PARAMS({entity_id, callback, suppress_log, show_info_window  }) ):
//-------------
//-Sends a request to the server to get the information for a passed in entity.
//  If no entity is passed in, use the VASIR_ENGINE.selected_entity 
//  Also takes in an optional callback function, which if specified will get
//      called on a successful response and will receive the entity info
//  Can also take in a show_info_window BOOLEAN that determines where to show 
//      and populate an HTML window. Default is false, but is set to True 
//      when user clicks 'get info' button
//---------------------------------------
VASIR_ENGINE.functions.get_entity_information = function(params){
    //Set the target
    var target = VASIR_ENGINE.selected_entity;
    var callback = undefined,
        show_info_window = undefined,
        suppress_log = undefined;

    //Check to see if they passed in an object or a string
    if( typeof params === 'object' ){
        //Set the message and style
        if(params.entity_id !== undefined){
            target = params.entity_id;
        }

        //Get params
        callback = params.callback;
        show_info_window = params.show_info_window;
        suppress_log = params.suppress_log;

    }else if(typeof params === 'string'){
        target = params;
    }

    //Set up the request object and send it
    $.ajax({
        url: '/get_entity_info/' + target + '/',
        type: 'GET',
        dataType: 'json',
        beforeSend: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Getting entity info...',
                'style': 'waiting',
                'suppress_log': suppress_log});

        },
        success: function(res){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response
            res = eval(res);

            //Update the entities that this app keeps track of
            VASIR_ENGINE.entities[target] = res;

            //Update the text that shows the target entity info 
            if( res.target !== undefined) {
                $('#target_entity_id').html(res.target);
            }else{
                $('#target_entity_id').html('None');
            }

            //Update the engine log
            VASIR_ENGINE.functions.update_log({
                'message':  'Entity Information Retrieved: <br />'
                            + 'ID: ' + res.id + '<br />'
                            + 'Name: ' + res.name + '<br />',
                'style': 'success',
                'suppress_log': suppress_log});

            //DEV: Log it to the console
            try{
                //console.log(res);
            }catch(err){}

            //Show info window if caller asked for it
            if(show_info_window === true){
                //Allow user to close window when pressing esc
                $(document).on('keyup', 
                    VASIR_ENGINE.functions.keydown_close_info_window);
                //Show the window
                $('#entity_information_wrapper').css(
                    'display', 'block');

                //Set entity name
                $('#entity_information_entity_name').html(
                    VASIR_ENGINE.entities[res.id].name);
                
                //Setup the D3 network graph 
                VASIR_ENGINE.D3.functions.setup_network_graph({
                    entity: VASIR_ENGINE.entities[res.id]
                });
                //Setup radar for persona
                VASIR_ENGINE.D3.functions.setup_radar({
                    adjust_data: true,
                    data: VASIR_ENGINE.entities[res.id].persona,
                    element: '#entity_information_persona_container',
                    entity: VASIR_ENGINE.entities[res.id],
                    show_inner_circle: true
                });
                //Setup radar for stats
                VASIR_ENGINE.D3.functions.setup_radar({
                    entity: VASIR_ENGINE.entities[res.id],
                    element: '#entity_information_stats_container',
                    data: VASIR_ENGINE.entities[res.id].stats,
                    show_inner_circle: false
                });
            }

            //Call the callback func if one was passed in
            if(callback !== undefined){
                callback(res);
            }

        },
        error: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Error!: ' + res.message,
                'style': 'error'});
        }
    });
}

//When 'i' is pressed, show entity info
VASIR_ENGINE.functions.keydown_show_info_window = function(event){
    //If they press escape, close the window
    if(event.keyCode === 73){
        VASIR_ENGINE.functions.get_entity_information({
            show_info_window: true
        });
    }
}

//---------------------------------------
//toggle_target_selection_mode(PARAMS({selection_mode})):
//-------------
//-Will toggle from no selection mode to entity_target selection mode.
//  If a type is passed in it will override the default toggle behavior
//---------------------------------------
VASIR_ENGINE.functions.toggle_target_selection_mode = function(params){
    var desired_selection_mode = undefined;

    //Check to see if they passed in an object or a string
    if( typeof params === 'object' ){
        //Set the message and style
        if(params.desired_selection_mode !== undefined){
            desired_selection_mode = params.desired_selection_mode;
        }
    }else if(typeof params === 'string'){
        desired_selection_mode= params;
    }

    //The possible selection mode (so far) are either the default, undefined,
    //  mode - or 'entity_target', which sets the current selected entity's
    //  target
    if((desired_selection_mode === undefined 
        && VASIR_ENGINE.selection_mode === null) || (
            desired_selection_mode === null)
        ){
        //Change from undefined to entity_target
        VASIR_ENGINE.selection_mode = 'entity_target';
        //Add the 'button_active' class to the set_entity_target button to indicate
        //  the selection mode has changed
        $('#set_entity_target').addClass('button_active');
        
        //Highlight the entity list
        $('#entities_list_header').css('background', 'rgba(240,240,100,.3)')
    }else if((
        desired_selection_mode === undefined 
        && VASIR_ENGINE.selection_mode === 'entity_target') || (
            desired_selection_mode === 'entity_target')
        ){
        //Change from entity_target to undefined
        VASIR_ENGINE.selection_mode = null; 
        //Remove the 'button_active' class to the set_entity_target button to indicate
        //  the selection mode has changed
        $('#set_entity_target').removeClass('button_active');

        //Unhighlight the entity list
        $('#entities_list_header').css('background', 'none');
    }

};

//---------------------------------------
//set_entity_target( PARAMS({target_entity_id}) ):
//-------------
//-Sends a request to the server to set the current entity's target
//  to the passed in target_entity_id
//---------------------------------------
VASIR_ENGINE.functions.set_entity_target = function(params){
    //Set the target
    var source_entity = VASIR_ENGINE.selected_entity;

    //Check to see if they passed in an object or a string
    if( typeof params === 'object' ){
        //Set the message and style
        if(params.target_entity_id !== undefined){
            target_entity_id = params.target_entity_id;
        }
        callback = params.callback;
    }else if(typeof params === 'string'){
        target_entity_id = params;
    }

    //Set up the request object and send it
    $.ajax({
        url: '/set_entity_target/' 
            + source_entity + '/'
            + target_entity_id + '/',
        method: 'GET',
        dataType: 'json',
        beforeSend: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Setting target...',
                'style': 'waiting'});

        },
        success: function(res){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response

            //Update the entities that this app keeps track of
            VASIR_ENGINE.entities[source_entity].target = target_entity_id;

            //Update the text that shows the target entity info
            $('#target_entity_id').html(target_entity_id);

            //Update the engine log
            VASIR_ENGINE.functions.update_log({
                'message':  'Entity ' 
                    + source_entity + ' target set to '
                    + target_entity_id,
                'style': 'success'});

            //Unset the target selection mode
            VASIR_ENGINE.functions.toggle_target_selection_mode();

            //Call the callback func if one was passed in
            if(callback !== undefined){
                callback(res);
            }

        },
        error: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Unable to set target',
                'style': 'error'});
        }

    })
}

//---------------------------------------
//converse( PARAMS() )
//-------------
//-Sends a request to the server to fire the converse action
//---------------------------------------
VASIR_ENGINE.functions.converse = function(params){
    //Set the target
    var source_entity = VASIR_ENGINE.selected_entity;


    //Set up the request object and send it
    $.ajax({
        url: '/converse/' 
            + source_entity + '/',
        method: 'GET',
        dataType: 'json',
        beforeSend: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Calling converse action...',
                'style': 'waiting'});

        },
        success: function(res){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response

            if (res.error !== undefined){
                VASIR_ENGINE.functions.update_log({
                    'message':  'Entity has no target',
                    'style': 'error'});
                return false;
            }
            //Update the engine log
            VASIR_ENGINE.functions.update_log({
                'message':  'Converation action completed',
                'style': 'success'});

            //Update info
            VASIR_ENGINE.functions.get_entity_information({
                'suppress_log': true,   
            });

        },
        error: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Unable to set target',
                'style': 'error'});
        }

    });
};

//============================================================================
//MISC ACTIONS
//============================================================================
//---------------------------------------
//update_log( PARAMS({message, style}) ):
//-------------
//  -Updates the engine log. Takes in a message and an
//  optional style, which can be either 'error' or 'success'. This affects the
//  style of the message
//---------------------------------------
VASIR_ENGINE.functions.update_log = function(params){
    //Set an empty message and style
    var message, style, log_el, suppress_log = undefined;
    log_el = $('#engine_log');

    //Check to see if they passed in an object or a string
    if( typeof params === 'object' ){
        //Set the message and style
        message = params.message;
        style = params.style;
        suppress_log = params.suppress_log;
    }else if(typeof params === 'string'){
        //Set the message to the passed in paramter
        //  Assume no style is provided
        message = params;
    }

    //Update the engine log
    //  Add a new list element to the log UL element
    if(suppress_log !== true){
        //Don't update the log if suppress_log is passed in
        $('#engine_log_ul').append($('<li/>', {
            'class': (style !== undefined) ? style : '',
            'html': (message !== undefined) ? message : ''
        }));

        //Scroll to bottom of the log
        log_el.prop({'scrollTop': log_el.prop('scrollHeight')});

        //If we want to animate
        //log_el.animate({ scrollTop: log_el.prop('scrollHeight') - log_el.height() },
        //    30);
    }
};

//---------------------------------------
//set_selected_entity( PARAMS({entity_id}) ):
//-------------
//-Sets the selected entity based on the passed in entity id ({STRING}).
//  If undefined (or nothing) is passed in, clear the selection
//  TODO: Update Entity Actions box
//---------------------------------------
VASIR_ENGINE.functions.set_selected_entity = function(params){
    //Set an empty message and style
    var target = undefined;

    //Check to see if they passed in an object or a string
    if( typeof params === 'object' ){
        //Set the message and style
        target = params.entity_id;
    }else if(typeof params === 'string'){
        //Set the message to the passed in paramter
        //  Assume no style is provided
        target = params;
    }

    //Set the selected entity
    VASIR_ENGINE.selected_entity = target;

    //Show the action wrapper if there is a valid entity
    if(target !== undefined){
        //Update the log
        VASIR_ENGINE.functions.update_log({
            'message': 'Selected Entity: ' + target,
            'style': 'success'});

        //Update the entity actions box
        $('#selected_entity').html(target);
        if(parseInt($('#entity_action_wrapper').css('opacity')) < 1){
            $('#entity_action_wrapper').css('opacity', 1);
        }
        
        //Get the current entity info
        VASIR_ENGINE.functions.get_entity_information();

        //Update the localStorage
        //VASIR_ENGINE.local_storage.set('app:selected_entity', target.toJSON());

    }else if(target === undefined){
        //Update the log
        VASIR_ENGINE.functions.update_log({
            'message': 'Removed entity from selection'});
        $('#entity_action_wrapper').css('opacity', 0);
    }
}

//---------------------------------------
//close_info_window(event)
//-------------
//Takes in a click event and closes the info window
//---------------------------------------
VASIR_ENGINE.functions.close_info_window = function(event){
    event.preventDefault();
    $('#entity_information_wrapper').css('display', 'none');
    //Unregister the keypress handler
    $(document).off('keyup', VASIR_ENGINE.functions.keydown_close_info_window);
}

//---------------------------------------
//close_info_window(event)
//-------------
//Takes in a keypress event and closes the info window
//---------------------------------------
VASIR_ENGINE.functions.keydown_close_info_window = function(event){
    //If they press escape, close the window
    if(event.keyCode === 27){
        VASIR_ENGINE.functions.close_info_window(event); 
    }
}
//============================================================================
//
//PAGE INIT (Attach events to elements)
//
//============================================================================
VASIR_ENGINE.functions.init = function(params){
    //------------------------------------------------------------------------
    //
    //Do initialization stuff
    //
    //------------------------------------------------------------------------
    //Get all the entities
    //TODO: Deprecated since we use websockets
    //VASIR_ENGINE.functions.get_game_state_request();

    //Setup canvas stuff
    VASIR_ENGINE.canvas.functions.init();

    //------------------------------------------------------------------------
    //
    //Web Socket stuff
    //
    //------------------------------------------------------------------------
    //Setup all the web socket functions
    VASIR_ENGINE.WEB_SOCKET.functions.init();
}

//------------------------------------------------------------------------
//
//Setup global fallbacks
//
//------------------------------------------------------------------------
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();
