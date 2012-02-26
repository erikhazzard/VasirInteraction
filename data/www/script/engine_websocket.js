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
    _port: '1337',
    functions: {
        'init': undefined,
        'heart_beat': undefined
    },
    previous_data: {}
}

//============================================================================
//
//Init function
//
//============================================================================
VASIR_ENGINE.WEB_SOCKET.functions.init = function(){
    //Call the heartbeat function
    VASIR_ENGINE.WEB_SOCKET.functions.game_state_heart_beat();
}
//============================================================================
//
//Heartbeat function
//
//============================================================================
VASIR_ENGINE.WEB_SOCKET.functions.game_state_heart_beat = function(){
    //Setup the socket object
    VASIR_ENGINE.WEB_SOCKET._socket = io.connect('http://' + 
        VASIR_ENGINE._HOST_NAME + ':' + VASIR_ENGINE.WEB_SOCKET._port);
    socket = VASIR_ENGINE.WEB_SOCKET._socket;

    socket.on('connect', function (res) {
        VASIR_ENGINE.functions.update_log({
            'message': 'WebSocket connected successfully',
            'style': 'success'});
    });
    socket.on('message', function (res) {
        //Check the response against the previous data.  If it is the same,
        //  we don't need to actually do anything
        if(VASIR_ENGINE.WEB_SOCKET.previous_data === res){
            //Previous and current data is same, so do nothing
        }
        else{
            //Game state has changed somehow, so update the client's
            //  game state
            VASIR_ENGINE.functions.update_game_state(res);
        }
        //Set the previous data to this current data
        VASIR_ENGINE.WEB_SOCKET.previous_data = res;

    });
}
