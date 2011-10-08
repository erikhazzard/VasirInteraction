/* ========================================================================    
 *
 * engine_socket.js
 * ----------------------
 *
 *  Web socket functions for the engine
 *
 * ======================================================================== */
//============================================================================
//
//Web socket functions
//
//============================================================================
VASIR_ENGINE.WEB_SOCKET = {
    _socket: undefined,
    functions: {
        'init': undefined,
        'heart_beat': undefined
    }
}

//============================================================================
//
//Init function
//
//============================================================================
VASIR_ENGINE.WEB_SOCKET.functions.init = function(){
    //Call the heartbeat function
    VASIR_ENGINE.WEB_SOCKET.functions.heart_beat();
}
//============================================================================
//
//Heartbeat function
//
//============================================================================
VASIR_ENGINE.WEB_SOCKET.functions.heart_beat = function(){
    //Setup the socket object
    VASIR_ENGINE.WEB_SOCKET._socket = io.connect('http://localhost:1337');
    socket = VASIR_ENGINE.WEB_SOCKET._socket;

    socket.on('connect', function (data) {
        console.log(data, 'zzz');
        socket.emit('set_name', 'zz');
    });
}
