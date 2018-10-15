#!/usr/bin/env node

var program = require('commander');
 
const templater = require('./src/templater-core.js');
const fs = require("fs-extra");
const path = require("path");
const assert = require("assert");

program
  .version('0.1.0')
  .command('template <config_path> <output_folder_path>')
  .description("A program designed to take one or more config declarations and generate code to be published for automating data transformation / ingestion.")
  .option('-s, --samples [folderpath]', 'Folder Path to location of samples. (Optional)')
  .option('-l, --log [logLevel]', 'Log level to output (INFO, WARN, DEBUG, ERROR)')
  .action(function(config_path, output_folder_path) {

    var configPath = path.resolve(config_path)
    var generatedFolder = path.resolve(output_folder_path);

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
            templater.process_config(configForProcessingPath, generatedFolder, program.samples, program.logLevel);
        }
    } else {
        //pointing at a specific config
        templater.process_config(configPath, generatedFolder, program.samples, program.log);
    }
  });

program.parse(process.argv);