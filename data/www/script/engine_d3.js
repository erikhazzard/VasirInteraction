/* ========================================================================    
 *
 * engine_d3.js
 * ----------------------
 *
 *  Handles d3 related stuff
 *
 * ======================================================================== */
//============================================================================
//Extend Main App Object
//============================================================================
VASIR_ENGINE.D3 = {
    functions: {
        setup_network_graph: undefined
    }
}

//============================================================================
//
//D3 Data Vis Functions
//
//============================================================================
//---------------------------------------
//setup_network_graph(PARAMS({ entity, svg_id })):
//-------------
//Creates a graph visualizing the passed in entity's network attribute.
//  Creates the graph in the passed in svg_id 
//---------------------------------------
VASIR_ENGINE.D3.functions.setup_network_graph = function(params){
    var entity = undefined; 
    var svg_id = 'entity_information_network_container';

    //Check for params
    if( typeof params === 'object' ){
        if( params.entity !== undefined){
            //They may pass in either a string ID or an entity object
            if( typeof params.entity === 'object' ){
                entity = params.entity;
            }else if( typeof params.entity === 'string'){
                entity = VASIR_ENGINE.entities[params.entity];
            }
        }else{
            //Assume an entity object was passed in
            entity = params
        }
        if( params.svg_id !== undefined){
            svg_id = params.svg_id;
        }
    }else if(typeof params === 'string'){
        //Assume an entity ID was passed in
        entity = VASIR_ENGINE.entities[params];
    }

    //If the entity wasn't set successfully, log a message and return false
    if(entity === undefined){
        VASIR_ENGINE.functions.update_log({
            'message': 'Invalid entity passed in to create graph',
            'style': 'error'
        });
        return false;
    }


    //Setup array to store possible connection type values for the d3 chart
    var con_types = ['negative', 'neutral', 'positive'];

    //Get down to business
    //Setup links
    var entity_links = [];
    for(cur_entity in entity.network){
        if(entity.network.hasOwnProperty(cur_entity)){
            //Connection type can be either neutral, postive, or negative
            //  Note: entity.network[cur_entity] is the value of the
            //  network connection
            //neutral
            var con_type = con_types[1];
            if(entity.network[cur_entity] > 0){
                //positive
                con_type = con_types[2];
            }else if(entity.network[cur_entity] < 0){
                //negative
                con_type = con_types[0];
            }

            //Add to entity_links array
            entity_links.push({
                'source': entity.name,
                'target': VASIR_ENGINE.entities[cur_entity].name,
                'type': con_type
            });
        }
    }

    //Setup a nodes dict to be used soon
    var nodes = {};

    // Compute the distinct nodes from the links.
    entity_links.forEach(function(link) {
      link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
      link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });

    //Setup width and height of the svg area
    var svg_w = parseInt($(
        '#entity_information_network_container').css('width'));
    var svg_h = parseInt($(
        '#entity_information_network_container').css('height'));

    //Setup the D3 force layout
    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(entity_links)
        .size([svg_w, svg_h])
        .linkDistance(40)
        .charge(-120)
        .on("tick", tick)
        .start();

    //Create the SVG element
    var svg = d3.select('#' + svg_id).append("svg:svg")
        .attr("width", svg_w)
        .attr("height", svg_h);

    // Per-type markers, as they don't inherit styles.
    svg.append("svg:defs").selectAll("marker")
        .data(con_types)
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    //Draw the lines between nodes
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
      .enter().append("svg:path")
        .attr("class", function(d) { return "link " + d.type; })
        //The follow will add an arrow.  Because the source and target are the same
        //  for our entities, we don't want to show the end caps
        //.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    //Draw the circles for each entity node
    var circle = svg.append("svg:g").selectAll("circle")
        .data(force.nodes())
      .enter().append("svg:circle")
        //Radius
        .attr("r", 7)
        .call(force.drag);

    //Setup the text that displays the entity names
    var text = svg.append("svg:g").selectAll("g")
        .data(force.nodes())
      .enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.
    text.append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "shadow")
        .text(function(d) { return d.name; });

    text.append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return d.name; });

    //Tick function called above
    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
      path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," 
          + d.source.y + "A" 
          + dr + "," 
          + dr + " 0 0,1 " 
          + d.target.x + "," 
          + d.target.y;
      });

      circle.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      text.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
}
