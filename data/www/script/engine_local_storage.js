/* ========================================================================    
 *
 * engine_localStorage.js
 * ----------------------
 *
 *  Contains localStorage related functions
 *
 * ======================================================================== */
//============================================================================
//LocalStorage Object
//============================================================================
if(VASIR_ENGINE.local_storage === undefined){
    VASIR_ENGINE.local_storage = {};
}

VASIR_ENGINE.local_storage.get = function(key){
    //Gets the passed in key if localStorage exists
    if(window.localStorage){
        return localStorage.getItem(key);
    }
}

VASIR_ENGINE.local_storage.set = function(key, value){
    //Sets a key:value pair in localStorage
    if(window.localStorage){
        return localStorage.setItem(key, value);
    }
}
