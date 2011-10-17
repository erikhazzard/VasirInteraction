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
    document.id('add_entity').addEvent('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.add_entity();
    });

    document.id('get_entities').addEvent('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.get_entities();
    });

    //-----------------------------------
    //ENTITY Actions
    //-----------------------------------
    document.id('clear_entity_selection').addEvent('click', function(e){
        //Set the target to nothing
        VASIR_ENGINE.functions.set_selected_entity();
    });   

    document.id('get_entity_info').addEvent('click', function(e){
        //Fire off the add_entity action
        VASIR_ENGINE.functions.get_entity_information({
            show_info_window: true
        });
    });
    document.id('set_entity_target').addEvent('click', function(e){
        VASIR_ENGINE.functions.toggle_target_selection_mode();
    });
    document.id('converse').addEvent('click', function(e){
        VASIR_ENGINE.functions.converse();
    });

    //-----------------------------------
    //Misc Actions
    //-----------------------------------
    //Clear log function
    document.id('clear_log').addEvent('click', function(e){
        e.preventDefault();
        document.id('engine_log_ul').empty();
        document.id('engine_log').highlight('#ababab');

    });

    //-----------------------------------
    //
    //Entity Information Window
    //
    //-----------------------------------
    document.id('entity_information_close').addEvent('click', function(e){
        e.preventDefault();
        document.id('entity_information_wrapper').setStyle('display', 'none');
    });


    //-----------------------------------
    //Call VASIR_ENGINE initialization function
    //-----------------------------------
    VASIR_ENGINE.functions.init();
});
