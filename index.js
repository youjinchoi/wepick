var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("mongo db connection OK.");
});

var testSchema = mongoose.Schema({
	name: String
});

var TestModel = mongoose.model("TestModel", testSchema);

var testIns = new TestModel({ name: "testIns" });
console.log(testIns.name); // "testIns"

testSchema.methods.speak = function () {
	var greeting = this.name
	? "Meow name is " + this.name
	: "I don't have a name"
	console.log(greeting);
}

var testIns = new TestModel({ name: "testIns" });
testIns.speak();

testIns.save(function(err, testIns){
	if(err) return console.error(err);
	testIns.speak();
});

TestModel.find(function(err, models){
	if(err) return console.error(err);
	console.log(models);
});

TestModel.find({name:/^testIns/}, callback);
