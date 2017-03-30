var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var roles = new Schema({
    role: {type: String, unique: true},
    lastModified: {type: Date, default: Date.now() },
    permissions: [String]
});

module.exports = mongoose.model('Roles', roles);