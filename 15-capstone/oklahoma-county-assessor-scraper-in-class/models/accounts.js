var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
	accountNumber: { type : String , unique : true, required : true, dropDups: true }
	TaxableMarket2016: String
	PhysicalAddress: String
	Type: String
	Owner Name1: String
	Owner Name2: String
	// accountLink: [String],
	
	
	/*sender: String,
	recipients: [String],
	cc: [String],
	text: String,
	mid: String,
	fpath: String,
	bcc: [String],
	to: [String],
	replyto: [String],
	ctype: String,
	fname: String,
	date: Date,
	subject: String*/
})
//schema.methods.sender = function () {this.sender;}
mongoose.connect('mongodb://localhost/okcounty_assessor')

var Account = mongoose.model('account', schema);
module.exports = Account
