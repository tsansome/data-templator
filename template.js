var program = require('commander');
 
const templater = require('./src/templater-core.js');
const fs = require("fs-extra");
const path = require("path");
const assert = require("assert");

program
  .version('0.1.0')
  .option('-c, --config <filepath/folderpath>', 'File / Folder Path to a single or collection of config files to use.')
  .option('-g, --generated <folderpath>', 'Folder Path to location to put generated folders.')
  .option('-s, --samples [folderpath]', 'Folder Path to location of samples. (Optional)')
  .parse(process.argv);

var configPath = path.resolve(program.config)
var generatedFolder = path.resolve(program.generated);

if (fs.lstatSync(configPath).isDirectory()) {
    //pointing at a folder of configs
    var configs = fs.readdirSync(configPath);
    console.log("Okay pointing at a folder of configs, found " + configs.length + " to process.");
    for(var ci in configs) {
        var configForProcessing = configs[ci];
        var configForProcessingPath = configPath + "/" + configForProcessing;
        templater.process_config(configForProcessingPath, generatedFolder, program.samples);
    }
} else {
    //pointing at a specific config
    templater.process_config(configPath, generatedFolder);
}