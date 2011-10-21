/* ========================================================================    
 *
 * engine_canvas.js
 * ----------------------
 *
 *  Handles canvas things
 *
 * ======================================================================== */
//============================================================================
//Extend Main App Object
//============================================================================
VASIR_ENGINE.canvas = {
    //HTML element related
    height:undefined,
    width: undefined,

    //Canvas object related
    _canvas: undefined,
    context: undefined,

    config: {
        entity_cell_position_modifier: 10,
        entity_width: 20,
        entity_height: 20
    },

    //entities stores canvas entities
    entities: {},

    functions: {
        clear: undefined,
        draw_entities: undefined,
        init: undefined,
        render: undefined,
        util: {
            draw_rect: undefined
        }
    },
    interval: undefined
};

//============================================================================
//
//Util Functions
//
//============================================================================
//---------------------------------------
//clear()
//-------
//Clears the canvas
//---------------------------------------
VASIR_ENGINE.canvas.functions.clear = function(){
    //Clear everything
    VASIR_ENGINE.canvas.context.clearRect(
        0,
        0,
        VASIR_ENGINE.canvas.width,
        VASIR_ENGINE.canvas.height);

}
//---------------------------------------
//draw_rect( PARAMS({x,y,w,h}) ):
//-------------
//-Draws a rectangle
//---------------------------------------
VASIR_ENGINE.canvas.functions.util.draw_rect = function(params, y, w, h, color){
    if( typeof params === 'object' ){
        var x = params.x;
        var y = params.y;
        var w = params.w;
        var h = params.h;
        var color = params.color;
    }else if(typeof params === 'number'){
        var x = params;
    }

    if(color === undefined){
        color = '#232323';
    }

    //Get context
    var ctx = VASIR_ENGINE.canvas.context;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
}
//============================================================================
//
//General Canvas Functions
//
//============================================================================
//---------------------------------------
//draw_entities( ):
//-------------
//Draws all the entities the client knows about
//---------------------------------------
VASIR_ENGINE.canvas.functions.draw_entities = function(){
    //We'll need to loop through all the entities and draw them to the canvas
    var cur_entity = undefined;
    for(i in VASIR_ENGINE.entities){
        if(i !== undefined){
            cur_entity = VASIR_ENGINE.entities[i];
            //Make sure current entity data has been retrieved from server
            //  (Because the response may take 50 ms, this draw_entity will be called
            //  before the data is sent back to client)
            if(cur_entity.persona !== undefined){
                //Generate a color based on entity personality
                var color_r = Math.abs(cur_entity.persona.extraversion
                    + cur_entity.persona.neuroticism);
                var color_g = Math.abs(cur_entity.persona.conscientiousness);
                var color_b = Math.abs(cur_entity.persona.agreeableness
                    + cur_entity.persona.openness);
            
                //Get hex value
                color_r = color_r.toString(16) + '0';
                color_r = color_r.substring(0,2);
                color_g = color_g.toString(16) + '0';
                color_g = color_g.substring(0,2);
                color_b = color_b.toString(16) + '0';
                color_b = color_b.substring(0,2);

                var color = '#' + color_r + color_g + color_b;

                //Draw a rect representing the entity
                VASIR_ENGINE.canvas.functions.util.draw_rect({
                    x: cur_entity.position[0] 
                        * VASIR_ENGINE.canvas.config.entity_cell_position_modifier,
                    y: cur_entity.position[1]  
                        * VASIR_ENGINE.canvas.config.entity_cell_position_modifier,
                    w: VASIR_ENGINE.canvas.config.entity_width,
                    h: VASIR_ENGINE.canvas.config.entity_height,
                    color: color
                });

                //If the entity is selected by the user, draw another 
                //  'target' rect
                if(VASIR_ENGINE.selected_entity !== undefined 
                    && VASIR_ENGINE.selected_entity == i){
                        VASIR_ENGINE.canvas.functions.util.draw_rect({
                            x: (cur_entity.position[0]
                                * VASIR_ENGINE.canvas.config.entity_cell_position_modifier) + 1, 
                            y: (cur_entity.position[1]
                                * VASIR_ENGINE.canvas.config.entity_cell_position_modifier) + 1,
                            w: VASIR_ENGINE.canvas.config.entity_width - 2,
                            h: VASIR_ENGINE.canvas.config.entity_height - 2,
                            color: '#efefef'
                        });
                }
            }
        }
    }
}

//============================================================================
//
//Mouse Related Events
//
//============================================================================
//---------------------------------------
//select_entity({ event }):
//-------------
//Called when the click event is fired on the canvas.  Loops through entities
//  and selects the entity if the mouse is over it
//---------------------------------------
VASIR_ENGINE.canvas.functions.select_entity = function(params, event_type){
    //first parameter should be an event object, second parameter (if not set in
    //  passed in params object), is the 'type' - a string that is either
    //  'click' or 'hover'
    if( typeof params === 'object' ){
        if(params.e !== undefined){
            var e = params.e;
            var event_type = params.event_type
        }else{
            var e = params;
        }
    }else{
        var e = params;
    }

    //Get mouse position from passed in event
    var mouse_position = {x: e.offsetX, y: e.offsetY};
    var cur_entity, pos_x, pos_y = undefined;

    //Loop through each entity and determine if entity was clicked
    for(i in VASIR_ENGINE.entities){
        if(i !== undefined){
            if(VASIR_ENGINE.entities[i].position !== undefined){
                cur_entity = VASIR_ENGINE.entities[i];

                //Store the current position
                pos_x = cur_entity.position[0] 
                    * VASIR_ENGINE.canvas.config.entity_cell_position_modifier;
                pos_y = cur_entity.position[1] 
                    * VASIR_ENGINE.canvas.config.entity_cell_position_modifier;
                 
                //Determine if mouse is in between the entity's x,y origin
                //  and their width, height
                if( (mouse_position.x >= pos_x &&
                    mouse_position.x <= (pos_x + 
                                        VASIR_ENGINE.canvas.config.entity_width)
                    ) &&
                    ( mouse_position.y >= pos_y &&
                      mouse_position.y <= (pos_y + 
                                        VASIR_ENGINE.canvas.config.entity_height)
                    )
                ){
                    //If this is a select event, set the target entity
                    if(event_type === 'click'){
                        //If they are not in 'SET TARGET' mode (meaning an entity
                        //  already selected and they are setting the targeted
                        //  entity's target)
                        //Also, pressing shift key will enable entity's target
                        //  selection mode
                        if(VASIR_ENGINE.selection_mode === null 
                            && e.shiftKey !== true){
                            VASIR_ENGINE.functions.set_selected_entity({
                                entity_id: cur_entity.id
                            });
                        }else if(VASIR_ENGINE.selection_mode ===
                            'entity_target' || e.shiftKey === true){
                            VASIR_ENGINE.functions.set_entity_target({
                                'target_entity_id': cur_entity.id 
                            });
                        }
                    }

                    //Entity was found, return it
                    return cur_entity.id;
                }
            }
        }
    }
}


//============================================================================
//
//Init and Render Functions
//
//============================================================================
//---------------------------------------
//init( ):
//-------------
//Sets up all the canvas stuff
//---------------------------------------
VASIR_ENGINE.canvas.functions.init = function(){
    //Get canvas object
    VASIR_ENGINE.canvas._canvas = $('#canvas')[0];
    VASIR_ENGINE.canvas.height = parseInt($('#canvas').css('height'));
    VASIR_ENGINE.canvas.width = parseInt($('#canvas').css('width'));

    //Get the context object
    VASIR_ENGINE.canvas.context = VASIR_ENGINE.canvas._canvas.getContext('2d');

    //-----------------------------------
    //Add events
    //-----------------------------------
    $(VASIR_ENGINE.canvas._canvas).bind('click', function(e){
        VASIR_ENGINE.canvas.functions.select_entity({
            e: e,
            event_type: 'click'
        });
    });

    //-----------------------------------
    //Setup the interval that the canvas will be refreshed at
    //-----------------------------------
    VASIR_ENGINE.canvas.interval = setInterval(
        VASIR_ENGINE.canvas.functions.render, 10);

    return true;
}

//---------------------------------------
//draw( ):
//-------------
//Handles the actual drawing of the canvas
//---------------------------------------
VASIR_ENGINE.canvas.functions.render = function(){
    //Get the context object, store a reference so it's easier to work with
    var ctx = VASIR_ENGINE.canvas.context;
    //Remove everything
    VASIR_ENGINE.canvas.functions.clear();

    //Draw entities
    ctx.fillStyle = '#232323';
    VASIR_ENGINE.canvas.functions.draw_entities();

}
