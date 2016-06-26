const fs = require('fs');
fs.stat(process.argv[3], (err, stat) => {
	if(err){
		fs.readFile(process.argv[2], (err, data) => {
			if(err){
				console.log("Error reading source file " + process.argv[2]);
				srcFile = null
			} else {
				fs.writeFile(process.argv[3], data, (err) => {
					if(err){
						console.log("Error copying file: " + err.message);
					} else {
						console.log("Copied " + process.argv[2] + " to " + process.argv[3]);
					}
				});
			}
		});
	} else {
		console.log("Destination file " + process.argv[3] + " already exists.");
		destFile = false;
	}
});

