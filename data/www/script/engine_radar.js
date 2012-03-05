/* ========================================================================    
 *
 * radar.js
 * ----------------------
 *
 * Function definition to generate the radar chart
 *
 *
 * ======================================================================== */
VASIR_ENGINE.D3.functions.setup_radar = function( params ){
    var entity = params.entity;
    var element = params.element;
    var data = [];

    //-----------------------------------
    //Setup the data
    var cur_children = [],
        cur_child = {},
        data = {'children': {}},
        total_values_combined = 0,
        highest_value = 0,
        scaling_factor = undefined;
    
    //---------------------------
    //Setup the _data object.  We'll determine percentages below
    //---------------------------
    for(datum in entity.persona){
        if(entity.persona.hasOwnProperty(datum)){
            //Setup temp data object
            data.children[datum] = {
                value: entity.persona[datum] + 100,
                percentage: 0
            };
            //Add to total values
            total_values_combined += data.children[datum].value;
            //Set highest value if necessary
            if(data.children[datum].value > highest_value){
                highest_value = data.children[datum].value;
            }
        }
    }

    //---------------------------
    //Setup percentages
    //---------------------------
    for(datum in data.children){
        if(data.children.hasOwnProperty(datum)){
            //Set percentage
            data.children[datum].percentage = (
                data.children[datum].value / total_values_combined);
        }
    }
    //-----------------------------------
    //Setup other svg / data vars
    //-----------------------------------
    //store the max value
    //  Make the max radar value a little bigger than the highest value
    
    /* note: if we wanted relative values, we'd use this
    var max_value_scale = .2;
    var max_radar_value = highest_value + (highest_value * max_value_scale);
    */
    
    //We're using min / max of -100/100, so set max to 200 (plus some padding)
    var max_radar_value = 220;
    
    //Empty the radar
    $(element).empty();

    //Get width and height of the svg element
    var h = $(element)[0].offsetHeight;
    var w = $(element)[0].offsetWidth;
    var x = undefined,
        y = undefined;
    var center = [
        w/2,
        h/2
    ];
    //Get radius
    var radius = 0;

    //Radius should be half of the smallest of width or height
    if(h > w){
        radius = w/2;
    //-----------------------------------
    }else{
        radius = h/2;
    }

    //Temp index we'll use in loops
    var index = 0;
    //Current value to use when looping through data
    var cur_value = 0;

    //array of points to use for the radar polygon
    var radar_points = [];

    //svg elements
    var radar_group, 
        radar_axes, 
        radar_polygon_circle_group,
        radar_circle_group,
        radar_polygon_group;

    //-----------------------------------
    //And colors for the cirlces
    var color = d3.scale.category10();

    //-----------------------------------
    //Setup svg object
    //-----------------------------------
    //Create SVG element
    svg = d3.select(element).append('svg:svg')
        .attr('width', w)
        .attr('height', h);

    //-----------------------------------
    //
    //Generate radar chart
    //
    //-----------------------------------
    //Add a group to contain the entire radar chart
    radar_group = svg.append('svg:g')
        .attr('id', 'radar_group_1')
    
    //Create group for axes
    radar_axes = radar_group.append('svg:g')
        .attr('id', 'radar_axes_1')
    
    //index is used to iterate over values below
    index=0;

    //Draw lines for each attribute, starting from origin
    mid_point_data = [];
    for(datum in data.children){
        if(data.children.hasOwnProperty(datum)){
            //Store x,y so we don't have to recalculate everytime
            x = (Math.cos(index*2*Math.PI/6) * radius) + center[0]
            y = (Math.sin(index*2*Math.PI/6) * radius) + center[1]
            cur_value = data.children[datum].value;

            //Store the data for the position of each midpoint of the axes
            mid_point_data.push([ 
                (Math.cos(index*2*Math.PI/6) * (radius/2)) + center[0],
                (Math.sin(index*2*Math.PI/6) * (radius/2)) + center[1]
            ]);

            //-------------------------------
            //Draw a line for each axis
            //-------------------------------
            radar_axes.append('svg:line')
                .attr('class', 'axes_line')
                .attr('id', 'axes_' + datum)
                .attr('x1', center[0])
                .attr('x2', x)
                .attr('y1', center[1])
                .attr('y2', y);

            //-------------------------------
            //Add a text label
            //-------------------------------
            radar_axes.append('svg:text')
                    .attr('class','axis_text')
                    .attr('x', x) 
                    .attr('y', y)
                    .attr('dx', function(d){
                        if(x<center[0]){
                            return -50;
                        }else{
                            return 50;
                        }
                    })
                    .attr("text-anchor", 'middle')
                    .text(datum);

            //-------------------------------
            //Add a point to the radar polygon
            //-------------------------------
            radar_points.push([
                //X point
                ((cur_value / max_radar_value) * (x-center[0]) 
                + center[0]),
                
                //Y point
                ((cur_value / max_radar_value) * (y-center[1]) 
                + center[1])
            ]);

            //Increase index
            index+=1;
        }
    }

    //Add a circle representing negative values
    //Polygon representing negative data
    radar_axes.append('svg:path')
        .attr('id', 'negative_value_polygon')
        .attr('d', function(d,i){
           return 'M' + mid_point_data.join('L') + 'Z';
        });

    /* DOT IN THE MIDDLE OF AXES
    radar_axes.append('svg:g')
        .attr('id', 'radar_circle_group_1')
        .attr('class', 'radar_circle_group')
        .selectAll('circle')
        .data(mid_point_data)
        .enter()
            .append('svg:circle')
            .attr('cx', function(d,i){
                return d[0];
            })
            .attr('cy', function(d,i){
                return d[1]
            })
            .attr('class', 'axes_center_mark')
            .attr('r', radius / 2)
    */

    /* SINGLE DOT IN MIDDLE
        .append('svg:circle')
            .attr('cx', center[0]) 
            .attr('cy', center[1])
            .attr('class', 'axes_center_mark')
            .attr('r', radius / 2)
    */

    //-----------------------------------
    //Setup Radar polygon
    //-----------------------------------
    //Add group
    radar_polygon_circle_group = radar_group.append('svg:g')
        .attr('id', 'radar_polygon_circle_group_1')
        .attr('class', 'radar_polygon_circle_group_1');

    //Add circles
    radar_polygon_circle_group.append('svg:g')
        .attr('id', 'radar_circle_group_1')
        .attr('class', 'radar_circle_group')
        .selectAll('circle')
        .data(radar_points)
        .enter()
            .append('svg:circle')
            .attr('cx', function(d,i){
                return d[0];
            })
            .attr('cy', function(d,i){
                return d[1];
            })
            .attr('r', '5');

    //Add polygon
    radar_polygon_circle_group.append('svg:path')
        .attr('id', 'radar_polygon_1')
        .attr('class', 'radar_polygon')
        .attr('d', function(d,i){
           return 'M' + radar_points.join('L') + 'Z';
        });

    radar_polygon_circle_group

    //Scale down the graph a little
    scaling_factor = .92;
    d3.select('#radar_group_1')
        .attr('transform', 'translate(' 
            + (-center[0] * (scaling_factor - 1))
            + ','
            + (-center[1] * (scaling_factor - 1))
            + ') scale(' + scaling_factor + ')')

}

/* ========================================================================    
 *
 * Interactive functions
 *
 * ======================================================================== */
/*
RADAR.functions.update_max_radar_value = function(){
    //This function is triggered whenever the range input changes

    //Update the max radar value
    //RADAR._data.chart_limit= parseInt(
    //    $('#radar_range').attr('value'), 10);
    RADAR._data.chart_limit = 400;

    //Regenerate the radar
    RADAR.functions.generate_radar();
}
*/
