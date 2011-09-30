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
    //Store reference to functions
    'functions': {
        //-----------------------------------
        //ENGINE Actions
        //-----------------------------------
        'add_entity': undefined,
        'get_entities': undefined,

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
        'set_selected_entity': undefined

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
    var req = new Request.JSON({
        url: '/create_entity/',
        secure: true,
        onRequest: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Sending request to create entity...',
                'style': 'waiting'});
        },
        onSuccess: function(res, txt){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response
            res = JSON.decode(res);
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
            VASIR_ENGINE.functions.get_entities();
        },
        onFailure: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Error!: ' + res.message,
                'style': 'error'});
        }

    }).send()
}

//---------------------------------------
//get_entities():
//-------------
//  -Sends a request to the server to get all the current entities.
//---------------------------------------
VASIR_ENGINE.functions.get_entities = function(){
    var req = new Request.JSON({
        url: '/get_entities/',
        secure: true,
        onRequest: function(){
            VASIR_ENGINE.functions.update_log(
                {'message': 'Sending request to get all entities...',
                'style': 'waiting'});

        },
        onSuccess: function(res, txt){
            //decode the JSON response
            res = JSON.decode(res);

            //Update the engine log
            VASIR_ENGINE.functions.update_log({
                'message': res.length + ' Entities Retrieved!',
                'style': 'success'});
                
            //Clear out the existing elements
            $('entities_list_ul').empty();

            //Loop through the returned entities and update the 
            //  VASIR_ENGINE.entities object
            for(var i=res.length-1; i>=0; i--){
                //Add the entity info
                VASIR_ENGINE.entities[res[i].id] = res[i];

                var list_element = new Element('li', {
                    'id': 'entity_' + res[i].id,
                });

                //Link (button)
                list_element.adopt(new Element('a', {
                    'href': '#',
                    'html': res[i].id,
                    'class':'button',
                    'events': {
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
                            }}(i, res[i].id)
                    }
                })); 

                //Add links to the entities list element
                $('entities_list_ul').adopt(list_element);

            }
            //Update the entities list header
            $('entities_list_header').innerHTML = 'All ' 
                + res.length + ' Entities';

        },
        onFailure: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Error!: ' + res.message,
                'style': 'error'});
        }

    }).send()
}
//============================================================================
//ENTITY RELATED
//============================================================================
//---------------------------------------
//get_entity_information( PARAMS({entity_id, callback, suppress_log }) ):
//-------------
//-Sends a request to the server to get the information for a passed in entity.
//  If no entity is passed in, use the VASIR_ENGINE.selected_entity 
//  Also takes in an optional callback function, which if specified will get
//      called on a successful response and will receive the entity info
//---------------------------------------
VASIR_ENGINE.functions.get_entity_information = function(params){
    //Set the target
    var target = VASIR_ENGINE.selected_entity;
    var callback = undefined;

    //Check to see if they passed in an object or a string
    if( typeof params === 'object' ){
        //Set the message and style
        if(params.entity_id !== undefined){
            target = params.entity_id;
        }
        callback = params.callback;
        var suppress_log = params.suppress_log;
    }else if(typeof params === 'string'){
        target = params;
    }
    //Set up the request object and send it
    var req = new Request.JSON({
        url: '/get_entity_info/' + target + '/',
        secure: true,
        onRequest: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Getting entity info...',
                'style': 'waiting',
                'suppress_log': suppress_log});

        },
        onSuccess: function(res, txt){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response
            res = JSON.decode(res);

            //Update the entities that this app keeps track of
            VASIR_ENGINE.entities[target] = res;

            //Update the text that shows the target entity info 
            if( res.target !== undefined) {
                $('target_entity_id').set('html', res.target);
            }else{
                $('target_entity_id').set('html', 'None');
            }

            //Update the engine log
            VASIR_ENGINE.functions.update_log({
                'message':  'Entity Information Retrieved: <br />'
                            + 'ID: ' + res.id + '<br />'
                            + 'Name: ' + res.name + '<br />',
                'style': 'success',
                'suppress_log': suppress_log});

            //Call the callback func if one was passed in
            if(callback !== undefined){
                callback(res);
            }

        },
        onFailure: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Error!: ' + res.message,
                'style': 'error'});
        }

    }).send()
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
        $('set_entity_target').addClass('button_active');
        
        //Highlight the entity list
        $('entities_list_header').setStyle('background', 'rgba(240,240,100,.3)')
        $('entities_list').highlight();
    }else if((
        desired_selection_mode === undefined 
        && VASIR_ENGINE.selection_mode === 'entity_target') || (
            desired_selection_mode === 'entity_target')
        ){
        //Change from entity_target to undefined
        VASIR_ENGINE.selection_mode = null; 
        //Remove the 'button_active' class to the set_entity_target button to indicate
        //  the selection mode has changed
        $('set_entity_target').removeClass('button_active');

        //Unhighlight the entity list
        $('entities_list_header').setStyle('background', 'none');
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
    var req = new Request.JSON({
        url: '/set_entity_target/' 
            + source_entity + '/'
            + target_entity_id + '/',
        secure: true,
        onRequest: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Setting target...',
                'style': 'waiting'});

        },
        onSuccess: function(res, txt){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response
            res = JSON.decode(res);

            //Update the entities that this app keeps track of
            VASIR_ENGINE.entities[source_entity].target = target_entity_id;

            //Update the text that shows the target entity info
            $('target_entity_id').set('html', target_entity_id);

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
        onFailure: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Unable to set target',
                'style': 'error'});
        }

    }).send()
}

//---------------------------------------
//converse( PARAMS() )
//-------------
//-Sends a request to the server to fire the converse action
//---------------------------------------
VASIR_ENGINE.functions.converse= function(params){
    //Set the target
    var source_entity = VASIR_ENGINE.selected_entity;


    //Set up the request object and send it
    var req = new Request.JSON({
        url: '/converse/' 
            + source_entity + '/',
        secure: true,
        onRequest: function(){
            //---------------------------
            //Call this when request is made
            //---------------------------
            //Update the log with the message we are sending
            VASIR_ENGINE.functions.update_log(
                {'message': 'Calling converse action...',
                'style': 'waiting'});

        },
        onSuccess: function(res, txt){
            //---------------------------
            //Call this when request succeeds
            //---------------------------
            //decode the JSON response
            res = JSON.decode(res);

            if (res.error !== undefined){
                $('entities_list').highlight();
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
        onFailure: function(res){
            //---------------------------
            //Call this when request fails
            //---------------------------
            VASIR_ENGINE.functions.update_log({
                'message': 'Unable to set target',
                'style': 'error'});
        }

    }).send()
}

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
    var message, style, suppress_log = undefined;

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
        $('engine_log_ul').adopt(new Element('li', {
            'class': (style !== undefined) ? style : '',
            'html': (message !== undefined) ? message : ''
        }));

        //Scroll to bottom of the log
        $('engine_log').scrollTop = $('engine_log').scrollHeight;
    }
}

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
        $('selected_entity').innerHTML = target;
        if(parseInt($('entity_action_wrapper').getStyle('opacity')) < 1){
            $('entity_action_wrapper').fade(1);
        }
        
        //Get the current entity info
        VASIR_ENGINE.functions.get_entity_information();

    }else if(target === undefined){
        //Update the log
        VASIR_ENGINE.functions.update_log({
            'message': 'Removed entity from selection'});
        $('entity_action_wrapper').fade(0);
    }
}
//============================================================================
//
//PAGE INIT (Attach events to elements)
//
//============================================================================
window.addEvent('domready', function(e){
    //------------------------------------------------------------------------
    //
    //Attach events to elements
    //
    //------------------------------------------------------------------------
    //-----------------------------------
    //ENGINE Actions
    //-----------------------------------
    $('add_entity').addEvent('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.add_entity();
    });

    $('get_entities').addEvent('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.get_entities();
    });

    //-----------------------------------
    //ENTITY Actions
    //-----------------------------------
    $('clear_entity_selection').addEvent('click', function(e){
        //Set the target to nothing
        VASIR_ENGINE.functions.set_selected_entity();
    });   

    $('get_entity_info').addEvent('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.get_entity_information();
    });
    $('set_entity_target').addEvent('click', function(e){
        VASIR_ENGINE.functions.toggle_target_selection_mode();
    });
    $('converse').addEvent('click', function(e){
        VASIR_ENGINE.functions.converse();
    });

    //-----------------------------------
    //Misc Actions
    //-----------------------------------
    //Clear log function
    $('clear_log').addEvent('click', function(e){
        e.preventDefault();
        $('engine_log_ul').empty();
        $('engine_log').highlight('#ababab');

    });

    //------------------------------------------------------------------------
    //
    //Do initialization stuff
    //
    //------------------------------------------------------------------------
    //Get all the entities
    VASIR_ENGINE.functions.get_entities();

    //Setup canvas stuff
    VASIR_ENGINE.canvas.functions.init();
});
