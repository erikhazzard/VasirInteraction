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
VASIR_ENGINE.canvas.functions.util.draw_rect = function(params, y, w, h){
    if( typeof params === 'object' ){
        var x = params.x;
        var y = params.y;
        var w = params.w;
        var h = params.h;
    }else if(typeof params === 'number'){
        var x = params;
    }

    //Get context
    var ctx = VASIR_ENGINE.canvas.context;
    ctx.beginPath();
    ctx.rect(x,y,w,h);
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
    VASIR_ENGINE.canvas._canvas = $('canvas');
    VASIR_ENGINE.canvas.height = parseInt($('canvas').getStyle('height'));
    VASIR_ENGINE.canvas.width = parseInt($('canvas').getStyle('width'));

    //Get the context object
    VASIR_ENGINE.canvas.context = VASIR_ENGINE.canvas._canvas.getContext('2d');

    //Setup the interval that the canvas will be refreshed at
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
    VASIR_ENGINE.canvas.functions.draw_entities();

}
