// Utility functions for data models.

// Attempt to set an attribute and assign its value.
const setAttribute = (model, attribute, value) => {
    if(model && model[attribute]){
        model[attribute] = value;
    }
    return model;
}

// Retrieve value stored in attribute, if attribute exists.
const getAttribute = (model, attribute) => {
    if(model && model[attribute]){
        return model[attribute];
    } else {
        throw new Error("Attribute does not exist on the queried data model.");
    }
}

// Attribute function.
const attr = function(attribute, value){
    if(value === undefined){
        return getAttribute(this, attribute);
    } else {
        return setAttribute(this, attribute, value);
    }
};

// Attach an attribute function suite to a model.
const attachMutator = (model) => {
    if(model){
        model.attr = (attr).bind(model);
    }
}

// Export code.
module.exports = {
    setAttribute,
    getAttribute,
    attachMutator
}


