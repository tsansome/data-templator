#!/usr/bin/env node

var program = require('commander');
 
const templater = require('./src/templater-core.js');
const fs = require("fs-extra");
const path = require("path");
const assert = require("assert");

const pkg = require("./package.json");

program
  .version(pkg.version)
  .description("Pass one or more config declarations and generate code to be published for automating data transformation / ingestion.")
  .option('-c, --config <filepath/folderpath>', 'File / Folder Path to a single or collection of config files to use.')
  .option('-o, --outputs <folderpath>', 'Folder Path to location to put outputted folders / files.')
  .option('-s, --samples_path [folderpath]', 'Folder Path to location of samples. (Optional)')
  .option('-l, --log [logLevel]', 'Log level to output (INFO, WARN, DEBUG, ERROR)')
  .option('-e, --env_file [filepath]', 'A path to an optional env.json object')
  .parse(process.argv);

if (program.config == undefined) throw Error("You must supply a valid path to a folder or a single config file using the parameter -c");
if (program.outputs == undefined) throw Error("You must supply a valid path to a folder for outputting all the files using the parameter -o.");

var configPath = path.resolve(program.config);
var generatedFolder = path.resolve(program.outputs);

if (fs.lstatSync(configPath).isDirectory()) {
    //pointing at a folder of configs, configs should be in mustache format and have _config at the end of the filename
    var configs = fs.readdirSync(configPath)
                    .filter(function(fp) {
                        return (path.extname(fp) == ".mustache" || path.extname(fp) == ".json") && path.basename(fp, path.extname(fp)).indexOf("_config") > -1
                    });
    console.log("Okay pointing at a folder of configs, found " + configs.length + " to process.");
    for(var ci in configs) {
        var configForProcessing = configs[ci];
        var configForProcessingPath = configPath + "/" + configForProcessing;
        templater.process_config(configForProcessingPath, generatedFolder, program.samples, program.log, program.env_file);
    }
} else {
    //pointing at a specific config
    templater.process_config(configPath, generatedFolder, program.samples, program.log, program.env_file);
}