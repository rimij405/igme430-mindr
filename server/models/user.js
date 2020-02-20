const log = require('../utils/logger-util.js');
const model = require('../utils/model-util.js');

// User data model.
class User {

    // Construction of a User data object.
    constructor(data) {
        // Core data members.
        this.username = data.username || null;
        this.password = data.password || null;
        this.plan = data.plan || null;
        this.dateCreated = data.dateCreated || new Date();
        this.dateUpdated = data.dateUpdated || this.dateCreated;
        model.attachMutator(this);
    }

    // Instance methods executed on a data object. //

    // Save the model, using the callback method to do so.
    save(onSave = undefined) {
        return new Promise((resolve, reject) => {
            if(!onSave){
                reject(log.createError('Save User', 'No callback was supplied.'));
            }
            console.log(log.createMessage('User', 'Saving user information.'));
            onSave(this).then(() => {
                console.log("User data saved successfully.")
                resolve(this);
            }).catch(err => reject(err));
        });
    }

    // Load the model, using the callback method to do so.
    load(onLoad = undefined) {
        return new Promise((resolve, reject) => {
            if(!onLoad){
                reject(log.createError('Load User', 'No callback was supplied.'));
            }
            console.log("Loading user data...");
            onLoad(this).then(() => {
                console.log("User data loaded successfully.");
                resolve(this);
            }).catch(err => reject(err));
        });
    }

}

// Export the user class.
module.exports = User;