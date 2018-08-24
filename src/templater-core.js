const Mustache = require("mustache");
//const fs = require("fs");
var fs = require("fs-extra");
const path = require("path");
const assert = require("assert");

const uuid = require('uuid')
const corrid = uuid.v1()

var log4js = require('log4js');
var logger = log4js.getLogger();

const templates_path = () => __dirname + "/../templates/";

/**
 * Process the config file given.
 * 
 * @param {string} configPath The path to the config file to process.
 * @param {string} generatedFolder The output folder path.
 * @param {string} samplesFolder The folder path to the samples. 
 * @param {string} logLevel The level to log out to.  
*/
exports.process_config = function(configPath, generatedFolder, samplesFolder, logLevel) {
    // TODO: remove this and find a way to escape '/' only
    Mustache.escape = function(text) {return text;};

    if (logLevel != undefined)  {
        logger.level = logLevel;
    } else {
        logger.level = 'info';
    }

    logger.info("==================================================================================");
    logger.info(`${path.basename(configPath)} requested for processing. Starting now. | ${corrid}`);
    logger.info("==================================================================================");

    logger.debug(`Exact path: ${path.resolve(configPath)} | ${corrid}`);
    if (!fs.existsSync(generatedFolder)) fs.mkdirSync(generatedFolder);
    var templatorConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    logger.debug(`${templatorConfig.datasets.length} datasets to generate code for. | ${corrid}`);
    //di = dataset index
    for(var di in templatorConfig.datasets) {
        //now that we have the dataset
        dataset_to_generate = templatorConfig.datasets[di];
        logger.info(`Templating ${dataset_to_generate.name} .. | ${corrid}`);        
        //apply the global config if defined
        dataset_to_generate = exports.resolve_global(templatorConfig.global, dataset_to_generate);
        //let's validate that they've deffined the dataset properly
        //firstly we ensure the columns are defined either through config or a sample
        if (samplesFolder != undefined && dataset_to_generate.source.columns == undefined) {
            logger.debug(`Caller defined columns in sample mode. | ${corrid}`);
            var sample = {
                file_path: path.resolve(`${samplesFolder}/${dataset_to_generate.name}.csv`)   
            };
            if (dataset_to_generate.sample != undefined) {
                if (dataset_to_generate.sample.file_path != undefined) {
                    sample.file_path = dataset_to_generate.sample.file_path;
                }
                if (dataset_to_generate.sample.delimeter != undefined) {
                    sample.delimiter = dataset_to_generate.sample.delimiter;
                }
            }
            if (fs.existsSync(sample.file_path)) {
                //run the profiler
                logger.info(`Obtaining columns through profiling ${sample.file_path} | ${corrid}`);
                dataset_to_generate.source.columns = profile_file(sample);
            }
        } 
        else {
            logger.debug(`Columns defined in config file mode. | ${corrid}`);
        }
        assert.notStrictEqual(dataset_to_generate.source.columns, undefined, `Dataset ${dataset_to_generate.name} does not have it's columns defined either by passing a sample or defining in the config.`);
        logger.debug(`Dataset ${dataset_to_generate.name} has ${dataset_to_generate.source.columns.length} columns | ${corrid}`);
        //#TODO: Validation of config
        //now let's loop through the patterns requested
        logger.debug(`${dataset_to_generate.templates.length} templates requested for generation. | ${corrid}`);
        //pi = index of the pattern
        for(var pi in dataset_to_generate.templates) {
            var pattern_to_generate = dataset_to_generate.templates[pi];
            logger.info(`Template ${pattern_to_generate.name} selected for ${dataset_to_generate.name} | ${corrid}`);
            //ensure that the pattern requested is supported
            var pattern_folder_path = path.resolve(templates_path() + pattern_to_generate.name.toUpperCase() + "/");
            assert.strictEqual(fs.existsSync(pattern_folder_path), true, `The pattern ${pattern_to_generate.name.toUpperCase()} is not one of the supported patterns. Please use one of the following: blah`);
            //now loop through the languages requested
            //pli = index of the language to implement for the pattern
            for (var pli in pattern_to_generate.generate) {
                var pattern_language_implementation_config = pattern_to_generate.generate[pli];
                logger.info(`Templating ${pattern_language_implementation_config.language} implementation. | ${corrid}`);
                //finalise the config
                var dataSetFinalConfig = exports.prepare_final_config(dataset_to_generate, pattern_language_implementation_config, pattern_to_generate);
                //remove the spaces in column names
                //now let's render
                //we need to choose the right template
                //find the template folder
                var languageFolderPath = pattern_folder_path + "/" + pattern_language_implementation_config.language.toUpperCase();
                //ensure that the language requested is supported
                assert.strictEqual(fs.existsSync(languageFolderPath), true, `The pattern ${pattern_to_generate.name.toUpperCase()} does not support ${pattern_language_implementation_config.language.toUpperCase()} as language, please use one of the following: blah ...`);
                //get the template files under that language
                var templateFiles = fs.readdirSync(languageFolderPath).filter(function(file) { return file.substr(-9) == ".mustache" });
                //read in the scripts config file for the template files
                var scriptsConfigPath = languageFolderPath + "/scripts_config.json"
                assert.strictEqual(fs.existsSync(scriptsConfigPath), true, `A scripts config file is not present for the language ${pattern_language_implementation_config.language.toUpperCase()} for the pattern ${pattern_to_generate.name.toUpperCase()}`);
                //okay let's get the script configs, also resolve any mustaching used, then attach it as an outputs array to the dataset
                var scriptConfigs = JSON.parse(fs.readFileSync(scriptsConfigPath, 'utf8'))
                                        .map(function(config) {
                                            if (config.output_file.sub_folder != undefined) config.output_file.sub_folder = Mustache.render(config.output_file.sub_folder, dataSetFinalConfig);
                                            config.output_file.name = Mustache.render(config.output_file.name, dataSetFinalConfig);
                                            return config;
                                        });
                dataSetFinalConfig.outputs = scriptConfigs;
                //now loop and generate                
                for (var template in templateFiles) {
                    //look for a valid config
                    var scriptConf = scriptConfigs.outputs.filter(function(conf) { return conf.script_name + ".mustache" == templateFiles[template] });
                    assert.strictEqual(scriptConf.length, 1, `1 config should be defined for ${templateFiles[template]} in the folder ${languageFolderPath}`);
                    //now let's generate it
                    var templatePath = languageFolderPath + "/" + templateFile;
                    var template_str = fs.readFileSync(templatePath, 'utf8');
                    var fc = generate_file_content_from_template(template_str, dataSetFinalConfig, generatedFolder)
                    write_output(fc, scriptConfigs[0]);
                }
            }

        }
        logger.info(`Templating finished for ${dataset_to_generate.name} | ${corrid}`);
    }
    logger.info(`All finished up, thanks for using the templator :). | ${corrid}`);
}

exports.resolve_global = function(global, dataset_to_generate) {
    //let's just apply mustache on the config so they can use anything in the dataset
    var template = JSON.stringify(dataset_to_generate);
    if (global != null) {
        logger.debug(`Global properties are defined. | ${corrid}`);
        dataset_to_generate.global = global;
    }
    var new_dataset_to_generate_string = Mustache.render(template, dataset_to_generate);
    return JSON.parse(new_dataset_to_generate_string);
}

/**
 * Profile a sample and return the columns in the file. 
 * No Column type support (23/08/2018)
 * 
 * @param {Object} sample The definition for the sample to use for profiling
*/
exports.profile_file = function(sample) {
    assert.notStrictEqual(sample.file_path, undefined, "Invalid sample, could not find a file path attribute.");
    var fp = path.resolve(sample.file_path);
    var ext = path.extname(fp);
    assert.strictEqual(ext, ".csv", "CSV is the only format supported for samples at this time.");
    //now profile
    var delimiter = ",";
    if (sample.delimiter != undefined) delimiter = sample.delimiter;
    var firstLine = fs.readFileSync(fp, 'utf-8').split('\n')[0];
    var columns = firstLine.split(delimiter).map(function(x) { return { "name": x.replace('\r','').replace('\n','') }; });
    return columns;
}

/**
 * Take the dataset and resolve the final config:
 * 1. Combine Source and Target between parent and pattern implementation
 * 2. Append last property for columns, primary_keys, date_columns to help with generating strings in mustache
 * 3. Append property of column without spaces for systems which do not like spaces in column names
 * 
 * @param {Object} dataset_to_generate The definition supplied for the dataset
 * @param {Object} pattern_language_implementation_config The definition for the pattern chosen for the dataset
 * @param {string} pattern_name The name of the pattern chosen to implement
*/
exports.prepare_final_config = function(dataset_to_generate, pattern_language_implementation_config, pattern_name) {
    //now prepare the final config for the mustache template
    var dataSetFinalConfig = dataset_to_generate;
    //first let's flatten the source and target defined 
    if (dataset_to_generate.source == null) dataset_to_generate.source = {};
    if (pattern_language_implementation_config.source == null) pattern_language_implementation_config.source = {};
    if (dataset_to_generate.target == null) dataset_to_generate.target = {};
    if (pattern_language_implementation_config.target == null) pattern_language_implementation_config.target = {};
    dataSetFinalConfig.source = Object.assign(dataset_to_generate.source, pattern_language_implementation_config.source);
    dataSetFinalConfig.target = Object.assign(dataset_to_generate.target, pattern_language_implementation_config.target);
    dataSetFinalConfig.language = pattern_language_implementation_config.language;
    dataSetFinalConfig.pattern = pattern_name;     
    if (pattern_language_implementation_config.properties == null) pattern_language_implementation_config.properties = {};
    dataSetFinalConfig.properties = pattern_language_implementation_config.properties;         
    //now for the arrays like columns and date_columns we need to add a last boolean to help with string generation
    assert.notStrictEqual(dataSetFinalConfig.source.columns, null, `It seems like you did not define any columns for the dataset. This is not allowed. Please provide either through samples or the config.`);
    assert.notStrictEqual(dataSetFinalConfig.source.columns.length, 0, `You cannot have 0 columns in a dataset.`);
    if (dataSetFinalConfig.source.date_columns != null && dataSetFinalConfig.source.date_columns.length > 0) {
        dataSetFinalConfig.source.date_columns[dataSetFinalConfig.source.date_columns.length - 1].last = true;
        dataSetFinalConfig.source.date_columns = dataSetFinalConfig.source.date_columns.map(function(v) { v.name_without_spaces = v.name.replace(" ","_"); return v; });
    }
    if (dataSetFinalConfig.source.primary_key != null && dataSetFinalConfig.source.primary_key.length > 0) {
        dataSetFinalConfig.source.primary_key[dataSetFinalConfig.source.primary_key.length - 1].last = true;
        dataSetFinalConfig.source.primary_key = dataSetFinalConfig.source.primary_key.map(function(v) { v.name_without_spaces = v.name.replace(" ","_"); return v; });
    }
    dataSetFinalConfig.source.columns[dataSetFinalConfig.source.columns.length - 1].last = true;     
    dataSetFinalConfig.source.columns = dataSetFinalConfig.source.columns.map(function(v) { v.name_without_spaces = v.name.replace(" ","_"); return v; });   
    return dataSetFinalConfig;
}

/**
 * Renders the files specified in the config to the file path specified in scripts_config.json.
 * 
 * @param {string} template_definition A string representation of the mustache content to put with the config.
 * @param {Object} config_definition Flattened config generated from the original config specified by the user.
 */
exports.generate_file_content_from_template = function(template_definition, config_definition){
    //so template it
    return Mustache.render(template_definition, config_definition);     
}

/**
 * Output the content out to a script file
 * 
 * @param {*} output_content 
 * @param {*} script_conf 
 */
exports.write_output = function(output_content, script_conf) {
     //prepare the output folder if not present
     var outputFileDir = output_folder + "/" + config_definition.language; 
     if (!fs.existsSync(outputFileDir)) fs.mkdirSync(outputFileDir);
 
     if (script_conf.output_file.sub_folder != null) {
         outputFileDir += "/" + script_conf.output_file.sub_folder;
         if (!fs.existsSync(outputFileDir)) {
             fs.ensureDirSync(outputFileDir);
         }
     }
     //write out the file
     var outputFileNameWithExt = script_conf.output_file.name + "." + scriptConf.output_file.extension;                        
     var outputFilePath = outputFileDir + "/" + outputFileNameWithExt;
     fs.writeFileSync(outputFilePath, output_content);
     logger.info(`Outputted ${script_conf.script_name} code to file ${outputFileNameWithExt} for implmentation. | ${corrid}`);
     logger.debug(`Exact path: ${path.resolve(outputFilePath)}. | ${corrid}`)
}
