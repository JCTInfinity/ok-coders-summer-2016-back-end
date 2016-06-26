const fs = require('fs');
fs.readFile(process.argv[2], (err, data) => {
	if(err){
		console.log("Error reading file " + process.argv[2]);
		console.log(err.toString());
	} else {
		console.log(data.toString());
	}
})