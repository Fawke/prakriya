var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var evaluation = new Schema({
	cadetID: {type: String, unique: true},
	cadetName: String,
  attitude: Number,
  punctuality: Number,
  programming: [Number],
  codequality: [Number],
  testability: [Number],
  engineeringculture: [Number],
  skills: [Number],
  communication: [Number],
  overall: String,
  doneWell: String,
  improvement: String,
	suggestions: String
});


module.exports = mongoose.model('Evaluation', evaluation);
