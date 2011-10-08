/* ========================================================================    
 *
 * page_init.js
 * ----------------------
 *
 *  Call VASIR_ENGINE initialization function
 *
 * ======================================================================== */
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

    //-----------------------------------
    //Call VASIR_ENGINE initialization function
    //-----------------------------------
    VASIR_ENGINE.functions.init();
});
