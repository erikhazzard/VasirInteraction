/* ========================================================================    
 *
 * engine_error.js
 * ----------------------
 *
 *  Contains the error class
 *
 * ======================================================================== */
//============================================================================
//Main Error class
//============================================================================
VASIR_ENGINE.ERRORS = {
    errors: [],
    create: function(params){
        //Add an error object to the errors list
        //  params should contain things like a message, location, additional
        //  debugging info, etc
        VASIR_ENGINE.ERRORS.errors.push(params);

        console.log(params);
    }
};
