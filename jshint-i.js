"use strict";

var fs = require("fs");
var JSHINT = require("jshint").JSHINT;

var queue;

function scan() {
	var file, config;
	var args = process.argv.slice(2);

	args.forEach(function (arg) {
		if (/^\-\-config\=(.+)/.test(arg)) {
			config = arg.slice(9);
		} else {
			file = arg;
		}
	});

	if (!file || !fs.existsSync(file)) {
		console.log("No file provided or file doesn't exist.");
		process.exit(2);
	}
	
	if (config) {
		if (!fs.existsSync(config)) {
			console.log("Config file doesn't exist.");
			process.exit(2);
		}
		
		config = JSON.parse(fs.readFileSync(config));
	}
	
	var source = fs.readFileSync(file, "utf-8");

	if (JSHINT(source, config || {})) {
		console.log("Your code passed JSHint!");
		process.exit(0);
	}

	queue = JSHINT.errors;
}

function prompt() {
	process.stdout.write("\n[n] Next; [r] Rescan; [q] Quit; Action: ");
	process.stdin.resume();	
}

function next() {
	if (queue.length === 0) {
		console.log("All done!");
		process.exit(0);
	}
	
	var curr = queue.shift();
	process.stdout.write("\u001B[2J\u001B[0;0f");

	console.log("Line:", curr.line);
	if (curr.character) {
		console.log("Character:", curr.character);
	}
		
	console.log("\n>", curr.evidence.replace(/^\s+/, ""));
	console.log(curr.reason);
	prompt();
}

process.stdin.on("data", function (cmd) {
	cmd = cmd.toString().replace(/\s+/, "");
	
	switch (cmd) {
		case "q":
			process.exit(0);
			break;
		case "n":
			process.stdin.pause();
			next();
			break;
		case "r":
			scan();
			next();
			break;
		default:
			process.stdin.pause();
			prompt();
	}
});

exports.run = function () {
	scan();
	next();
};