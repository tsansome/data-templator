#!/usr/bin/env node

const Mustache = require("mustache");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

var program = require('commander');
 
program
  .version('0.1.0')
  .option('-c, --config <filepath>', 'File Path to config file to use.')
  .option('-g, --generated <folderpath>', 'Folder Path to location to put generated folders.')
  .option('-s, --samples [folderpath]', 'Folder Path to location of samples. (Optional)')
  .parse(process.argv);


var configPath = path.resolve(program.config)
var templatorConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
var generatedFolder = path.resolve(program.generated);
if (!fs.existsSync(generatedFolder)) fs.mkdirSync(generatedFolder);

function profile_file(sample) {
    assert.notStrictEqual(sample.file_path, undefined, "Invalid sample, could not find a file path attribute.");
    var fp = path.resolve(sample.file_path);
    var ext = path.extname(fp);
    assert.strictEqual(ext, ".csv", "Comma Delimeted CSV is the only format supported for samples at this time.");
    //now profile
    var delimeter = ",";
    if (sample.delimeter != undefined) delimeter = sample.delimeter;
    var firstLine = fs.readFileSync(fp, 'utf-8').split('\n')[0];
    var columns = firstLine.split(delimeter).map(function(x) { return { "name": x.replace('\r','').replace('\n','') }; });
    return columns;
}

var outputtedFilesCount = 0;
console.log("Found " + templatorConfig.datasets.length + " datasets to generate code for.");
//di = dataset index
for(var di in templatorConfig.datasets) {
    //now that we have the dataset
    dataset_to_generate = templatorConfig.datasets[di];
    //let's just apply mustache on the config so they can use anything in the dataset
    var template = JSON.stringify(dataset_to_generate);
    var new_dataset_to_generate_string = Mustache.render(template, dataset_to_generate);
    dataset_to_generate = JSON.parse(new_dataset_to_generate_string);
    //let's validate that they've defined the dataset properly
    //firstly we ensure the columns are defined either through config or a sample
    if (program.samples != undefined && dataset_to_generate.source.columns == undefined) {
        var sample = {
          file_path: path.resolve(program.samples + "/" + dataset_to_generate.name + ".csv")   
        };
        if (dataset_to_generate.sample != undefined) {
            if (dataset_to_generate.sample.file_path != undefined) {
                sample = dataset_to_generate.sample.file_path;
            }
        }
        if (fs.existsSync(sample.file_path)) {
            //run the profiler
            dataset_to_generate.source.columns = profile_file(sample);
        }
    } 
    assert.notStrictEqual(dataset_to_generate.source.columns, undefined, "Dataset " + dataset_to_generate.name + " does not have it's columns defined either by passing a sample or defining in the config.");
    //#TODO: Validation of config
    //now let's loop through the patterns requested
    console.log(dataset_to_generate.patterns.length + " patterns requested for generation.");
    //pi = index of the pattern
    for(var pi in dataset_to_generate.patterns) {
        var pattern_to_generate = dataset_to_generate.patterns[pi];
        //ensure that the pattern requested is supported
        var pattern_folder_path = path.resolve(__dirname + "/templates/" + pattern_to_generate.name.toUpperCase() + "/");
        assert.strictEqual(fs.existsSync(pattern_folder_path), true, "The pattern " + pattern_to_generate.name.toUpperCase() + " is not one of the supported patterns. Please use one of the following: blah");
        //now loop through the languages requested
        //pli = index of the language to implement for the pattern
        for (var pli in pattern_to_generate.generate) {
            var pattern_language_implementation_config = pattern_to_generate.generate[pli];
            //now prepare the final config for the mustache template
            var dataSetFinalConfig = dataset_to_generate;
            if (dataset_to_generate.source == null) dataset_to_generate.source = {};
            if (pattern_language_implementation_config.source == null) pattern_language_implementation_config.source = {};
            if (dataset_to_generate.target == null) dataset_to_generate.target = {};
            if (pattern_language_implementation_config.target == null) pattern_language_implementation_config.target = {};
            dataSetFinalConfig.source = Object.assign(dataset_to_generate.source, pattern_language_implementation_config.source);
            dataSetFinalConfig.target = Object.assign(dataset_to_generate.target, pattern_language_implementation_config.target);
            dataSetFinalConfig.language = pattern_language_implementation_config.language;
            dataSetFinalConfig.pattern = pattern_to_generate.name;
            //now for the arrays like columns and date_columns we need to add a last boolean to help with string generation
            if (dataSetFinalConfig.source.columns == null) dataSetFinalConfig.source.columns = [];
            if (dataSetFinalConfig.source.date_columns == null) dataSetFinalConfig.source.date_columns = [];
            if (dataSetFinalConfig.source.primary_key == null) dataSetFinalConfig.source.primary_key = [];
            dataSetFinalConfig.source.columns[dataSetFinalConfig.source.columns.length - 1].last = true;
            dataSetFinalConfig.source.date_columns[dataSetFinalConfig.source.date_columns.length - 1].last = true;
            dataSetFinalConfig.source.primary_key[dataSetFinalConfig.source.primary_key.length - 1].last = true;
            //now let's render
            //we need to choose the right template
            //find the template folder
            var languageFolderPath = pattern_folder_path + "/" + pattern_language_implementation_config.language.toUpperCase();
            //ensure that the language requested is supported
            assert.strictEqual(fs.existsSync(languageFolderPath), true, "The pattern " + pattern_to_generate.name.toUpperCase() + " does not support " + pattern_language_implementation_config.language.toUpperCase() + " as language, please use one of the following: blah ...");
            //get the template files under that language
            var templateFiles = fs.readdirSync(languageFolderPath).filter(function(file) { return file.substr(-9) == ".mustache" });
            //read in the scripts config file for the template files
            var scriptsConfigPath = languageFolderPath + "/scripts_config.json"
            assert.strictEqual(fs.existsSync(scriptsConfigPath), true, "A scripts config file is not present for the language " + pattern_language_implementation_config.language.toUpperCase() + " for the pattern " + pattern_to_generate.name.toUpperCase());
            var scriptConfigs = JSON.parse(fs.readFileSync(scriptsConfigPath, 'utf8'));
            //now loop and generate
            for (var fi in templateFiles) {
                var fp = languageFolderPath + "/" + templateFiles[fi];
                //look for a valid config
                var scriptConf = scriptConfigs.filter(function(conf) { return conf.script_name + ".mustache" == templateFiles[fi] });
                assert.strictEqual(scriptConf.length, 1, "1 config should be defined for " + templateFiles[fi] + " in the folder " + languageFolderPath);                        
                //so template it
                var template_str = fs.readFileSync(fp, 'utf8');
                var output = Mustache.render(template_str, dataSetFinalConfig);                        
                //prepare the output folder if not present
                var output_filedir = generatedFolder + "/" + dataSetFinalConfig.language; 
                if (!fs.existsSync(output_filedir)) fs.mkdirSync(output_filedir);
                //write out the file
                var outputFileNameWithExt = Mustache.render(scriptConf[0].output.filename, dataSetFinalConfig) + "." + scriptConf[0].output.extension;                        
                fs.writeFileSync(output_filedir + "/" + outputFileNameWithExt, output);
                outputtedFilesCount++;
            }
        }
        
    }
}
console.log("Successfully generated " + outputtedFilesCount + " files for deployment.");