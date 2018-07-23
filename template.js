#!/usr/bin/env node

const Mustache = require("mustache");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

var program = require('commander');
 
program
  .version('0.1.0')
  .option('-c, --config [path]', 'Path to config file to use')
  .parse(process.argv);


var configPath = path.resolve(program.config)
var obj = JSON.parse(fs.readFileSync(configPath, 'utf8'));
var generatedFolder = path.dirname(configPath) + "/generated/";
if (!fs.existsSync(generatedFolder)) fs.mkdirSync(generatedFolder);

var outputtedFilesCount = 0;
console.log("Found " + obj.datasets.length + " datasets to generate code for.");
for(var dataset_index in obj.datasets) {
    //now that we have the dataset
    dataset_to_generate = obj.datasets[dataset_index];
    //let's just apply mustache on the config so they can use anything in the dataset
    var template = JSON.stringify(dataset_to_generate);
    var new_dataset_to_generate_string = Mustache.render(template, dataset_to_generate);
    dataset_to_generate = JSON.parse(new_dataset_to_generate_string);
    //let's validate that they've defined the dataset properly
    //#TODO: Validation of config
    //now let's loop through the patterns requested
    console.log(dataset_to_generate.patterns.length + " patterns requested for generation.");
    for(var pi in dataset_to_generate.patterns) {
        var pattern_to_generate = dataset_to_generate.patterns[pi];
        //ensure that the pattern requested is supported
        assert.strictEqual(fs.existsSync("templates/" + pattern_to_generate.name.toUpperCase() + "/"), true, "The pattern " + pattern_to_generate.name.toUpperCase() + " is not one of the supported patterns. Please use one of the following: blah");
        //now loop through the languages requested
        for (var pattern_language_implementation_index in pattern_to_generate.generate) {
            var pattern_language_implementation_config = pattern_to_generate.generate[pattern_language_implementation_index];
            //now prepare the final config for the mustache template
            var dsFinalConfig = dataset_to_generate;
            if (dataset_to_generate.source == null) dataset_to_generate.source = {};
            if (pattern_language_implementation_config.source == null) pattern_language_implementation_config.source = {};
            if (dataset_to_generate.target == null) dataset_to_generate.target = {};
            if (pattern_language_implementation_config.target == null) pattern_language_implementation_config.target = {};
            dsFinalConfig.source = Object.assign(dataset_to_generate.source, pattern_language_implementation_config.source);
            dsFinalConfig.target = Object.assign(dataset_to_generate.target, pattern_language_implementation_config.target);
            dsFinalConfig.language = pattern_language_implementation_config.language;
            dsFinalConfig.pattern = pattern_to_generate.name;
            //now for the arrays like columns and date_columns we need to add a last boolean to help with string generation
            if (dsFinalConfig.source.columns == null) dsFinalConfig.source.columns = [];
            if (dsFinalConfig.source.date_columns == null) dsFinalConfig.source.date_columns = [];
            if (dsFinalConfig.source.primary_key == null) dsFinalConfig.source.primary_key = [];
            dsFinalConfig.source.columns[dsFinalConfig.source.columns.length - 1].last = true;
            dsFinalConfig.source.date_columns[dsFinalConfig.source.date_columns.length - 1].last = true;
            dsFinalConfig.source.primary_key[dsFinalConfig.source.primary_key.length - 1].last = true;
            //now let's render
            //we need to choose the right template
            //find the template folder
            var folderPath = "templates/" + dsFinalConfig.pattern.toUpperCase() + "/" + dsFinalConfig.language.toUpperCase() + "/";
            //ensure that the language requested is supported and has a scripts_config
            assert.strictEqual(fs.existsSync("templates/" + pattern_to_generate.name.toUpperCase() + "/" + pattern_language_implementation_config.language.toUpperCase()), true, "The pattern " + pattern_to_generate.name.toUpperCase() + " does not support " + pattern_language_implementation_config.language.toUpperCase() + " as language, please use one of the following: blah ...");
            //get the template files under that language
            var templateFiles = fs.readdirSync(folderPath).filter(function(file) { return file.substr(-9) == ".mustache" });
            //read in the scripts config file for the template files
            assert.strictEqual(fs.existsSync(folderPath + "scripts_config.json"), true, "A scripts config file is not present for the language " + pattern_language_implementation_config.language.toUpperCase() + " for the pattern " + pattern_to_generate.name.toUpperCase());
            var script_configs = JSON.parse(fs.readFileSync(folderPath + "scripts_config.json", 'utf8'));
            //now loop and generate
            for (var fi in templateFiles) {
                var fp = folderPath + templateFiles[fi];
                //look for a valid config
                var scriptConf = script_configs.filter(function(conf) { return conf.script_name + ".mustache" == templateFiles[fi] });
                assert.strictEqual(scriptConf.length, 1, "1 config should be defined for " + templateFiles[fi] + " in the folder " + folderPath);                        
                //so template it
                var template_str = fs.readFileSync(fp, 'utf8');
                var output = Mustache.render(template_str, dsFinalConfig);                        
                //prepare the output folder if not present
                var output_filedir = generatedFolder + dsFinalConfig.language; 
                if (!fs.existsSync(output_filedir)) fs.mkdirSync(output_filedir);
                //write out the file
                var outputFileNameWithExt = Mustache.render(scriptConf[0].output.filename, dsFinalConfig) + "." + scriptConf[0].output.extension;                        
                fs.writeFileSync(output_filedir + "/" + outputFileNameWithExt, output);
                outputtedFilesCount++;
            }
        }
        
    }
}
console.log("Successfully generated " + outputtedFilesCount + " files for deployment.");