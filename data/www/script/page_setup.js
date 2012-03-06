/* ========================================================================    
 *
 * page_init.js
 * ----------------------
 *
 *  Call VASIR_ENGINE initialization function
 *
 * ======================================================================== */
$('document').ready(function(){
    //------------------------------------------------------------------------
    //
    //Attach events to elements
    //
    //------------------------------------------------------------------------
    //-----------------------------------
    //ENGINE Actions
    //-----------------------------------
    $('#add_entity').bind('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.add_entity();
    });

    $('#get_entities').bind('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.get_game_state_request();
    });

    //-----------------------------------
    //ENTITY Actions
    //-----------------------------------
    $('#clear_entity_selection').bind('click', function(e){
        //Set the target to nothing
        VASIR_ENGINE.functions.set_selected_entity();
    });   

    //Get entity info
    $('#get_entity_info').bind('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.get_entity_information({
            show_info_window: true
        });
    });

    //Also bind 'i' to get entity info

    $('#set_entity_target').bind('click', function(e){
        VASIR_ENGINE.functions.toggle_target_selection_mode();
    });
    $('#converse').bind('click', function(e){
        VASIR_ENGINE.functions.converse();
    });

    //-----------------------------------
    //Misc Actions
    //-----------------------------------
    //Clear log function
    $('#clear_log').bind('click', function(e){
        e.preventDefault();
        $('#engine_log_ul').html('');
    });

    //-----------------------------------
    //
    //Entity Information Window
    //
    //-----------------------------------
    $('#entity_information_close').bind('click', function(e){
        VASIR_ENGINE.functions.close_info_window(e);
    });


    //-----------------------------------
    //Call VASIR_ENGINE initialization function
    //-----------------------------------
    VASIR_ENGINE.functions.init();
});
