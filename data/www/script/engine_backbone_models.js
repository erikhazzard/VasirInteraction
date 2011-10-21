/* ========================================================================    
 *
 * engine_backbone_models.js
 * ----------------------
 *
 *  Contains models 
 *
 * ======================================================================== */
//============================================================================
//
//Models
//
//============================================================================
VASIR_ENGINE.models = {}

//============================================================================
//
//Entity Model
//
//============================================================================
VASIR_ENGINE.models.entity = Backbone.Model.extend({
    defaults: {
        id: 'entity_1_vasir'
        name: 'Vasir',
        gender: 'Male',
        money: 0,
        target: undefined,
        persona: {
            //Persona describes the psyche of the entity
            agreeableness: 0,
            conscientiousness: 0,
            extraversion: 0,
            neuroticism: 0,
            openness: 0
        },
        goals: {
            //Goals will be set here, ex.
            //creativity: 50
            //friendship: 50
        },
        network: {
            //Network contains information about entities this entity knows
            //  and a value associated with how the entity views the other 
            //  entity, e.g.
            //entity_X: 100
        },
        //position is this entity's location in the game world in [X,Y,Z]
        //  Note: A grid based system isn't used, so this can be a continous
        //  value. Z will usually be 0
        position: [0, 0, 0],
        stats: {
            //Stats affect various gameplay elements, and possibly other things
            //  later on.  Not really used yet 
           agility: 0,
           dexterity: 0,
           intelligence: 0,
           stamina: 0,
           strength: 0,
           wisdom: 0
        }
    }
});

//============================================================================
//
//Entities Collection
//
//============================================================================
VASIR_ENGINE.models.entities = Backbone.Collection.extend({
    model: VASIR_ENGINE.models.entity
});
