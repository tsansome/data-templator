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
const type_mappings_path = () => __dirname + "/../type_mappings/";

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

    var packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname + "/../package.json"), 'utf-8'));
    var templator_info_obj = {
        version : packageJson.version
    };
    logger.info(`============== Templator v${templator_info_obj.version} ==============================`);
    logger.info("==================================================================================");
    logger.info(`${path.basename(configPath)} requested for processing. Starting now. | ${corrid}`);
    logger.info("==================================================================================");    

    logger.debug(`Exact path: ${path.resolve(configPath)} | ${corrid}`);
    if (!fs.existsSync(generatedFolder)) fs.mkdirSync(generatedFolder);
    var templatorConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    logger.debug(`${templatorConfig.datasets.length} datasets to generate code for. | ${corrid}`);

    //let's add the built in type_mappings to global
    if (templatorConfig.global == null) templatorConfig.global = {};
    if (templatorConfig.global.type_mappings == null) templatorConfig.global.type_mappings = [];
    var builtInTypeMappings = fs.readdirSync(path.resolve(type_mappings_path()))
                                .map(f => {
                                    return {
                                        name: "builtin/" + path.basename(f),
                                        definition: JSON.parse(fs.readFileSync(f))
                                    }
                                });                 
    templatorConfig.global.type_mappings.push(builtInTypeMappings);

    //di = dataset index
    for(var di in templatorConfig.datasets) {
        //now that we have the dataset
        datasetToGenerate = templatorConfig.datasets[di];
        logger.info(`Templating ${datasetToGenerate.name} .. | ${corrid}`);        
        //apply the global config if defined
        dataSetToGenerate = exports.resolve_global(templatorConfig.global, datasetToGenerate);
        //now we'll just attach some versioning around the templator being used        
        dataSetToGenerate.templator_info = templator_info_obj;
        //let's validate that they've deffined the dataset properly
        //firstly we ensure the columns are defined either through config or a sample
        if (samplesFolder != undefined && datasetToGenerate.source.columns == undefined) {
            logger.debug(`Caller defined columns in sample mode. | ${corrid}`);
            var sample = {
                file_path: path.resolve(`${samplesFolder}/${datasetToGenerate.name}.csv`)   
            };
            if (datasetToGenerate.sample != undefined) {
                if (datasetToGenerate.sample.file_path != undefined) {
                    sample.file_path = datasetToGenerate.sample.file_path;
                }
                if (datasetToGenerate.sample.delimeter != undefined) {
                    sample.delimiter = datasetToGenerate.sample.delimiter;
                }
            }
            if (fs.existsSync(sample.file_path)) {
                //run the profiler
                logger.info(`Obtaining columns through profiling ${sample.file_path} | ${corrid}`);
                datasetToGenerate.source.columns = profile_file(sample);
            }
        } 
        else {
            logger.debug(`Columns defined in config file mode. | ${corrid}`);
        }
        assert.notStrictEqual(datasetToGenerate.source.columns, undefined, `Dataset ${datasetToGenerate.name} does not have it's columns defined either by passing a sample or defining in the config.`);
        logger.debug(`Dataset ${datasetToGenerate.name} has ${datasetToGenerate.source.columns.length} columns | ${corrid}`);
        //#TODO: Validation of config
        //now let's loop through the patterns requested
        logger.debug(`${datasetToGenerate.templates.length} templates requested for generation. | ${corrid}`);
        //pi = index of the pattern
        for(var pi in datasetToGenerate.templates) {
            var templateToGenerate = datasetToGenerate.templates[pi];
            logger.info(`Template ${templateToGenerate.name} selected for ${datasetToGenerate.name} | ${corrid}`);
            //ensure that the pattern requested is supported
            var pattern_folder_path = path.resolve(templates_path() + templateToGenerate.name.toUpperCase() + "/");
            assert.strictEqual(fs.existsSync(pattern_folder_path), true, `The pattern ${templateToGenerate.name.toUpperCase()} is not one of the supported patterns. Please use one of the following: blah`);
            //now loop through the languages requested
            //pli = index of the language to implement for the pattern
            for (var pli in templateToGenerate.generate) {
                var templateLanguageConfig = templateToGenerate.generate[pli];
                logger.info(`Templating ${templateLanguageConfig.language} implementation. | ${corrid}`);
                //finalise the config
                var dataSetFinalConfig = exports.prepare_final_config(datasetToGenerate, templateLanguageConfig, templateToGenerate, templatorConfig.global);
                //remove the spaces in column names
                //now let's render
                //we need to choose the right template
                //find the template folder
                var languageFolderPath = pattern_folder_path + "/" + templateLanguageConfig.language.toUpperCase();
                //ensure that the language requested is supported
                assert.strictEqual(fs.existsSync(languageFolderPath), true, `The pattern ${templateToGenerate.name.toUpperCase()} does not support ${templateLanguageConfig.language.toUpperCase()} as language, please use one of the following: blah ...`);
                //get the template files under that language
                var templateFiles = fs.readdirSync(languageFolderPath).filter(function(file) { return file.substr(-9) == ".mustache" });
                //read in the scripts config file for the template files
                var templateConfigPath = languageFolderPath + "/template_config.json"
                assert.strictEqual(fs.existsSync(templateConfigPath), true, `A template config file is not present for the language ${templateLanguageConfig.language.toUpperCase()} for the pattern ${templateToGenerate.name.toUpperCase()}`);
                //okay let's get the script configs, also resolve any mustaching used, then attach it as an outputs array to the dataset
                var templateConfigObj = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
                dataSetFinalConfig.template_config = templateConfigObj;
                //process the script configs
                var scriptConfigs = templateConfigObj
                                        .scripts
                                        .map(function(config) {
                                            if (config.output_file.sub_folder != undefined) config.output_file.sub_folder = exports.mustache_recursive(config.output_file.sub_folder, dataSetFinalConfig);
                                            config.output_file.name = exports.mustache_recursive(config.output_file.name, dataSetFinalConfig);
                                            return config;
                                        });
                //now attach back as the outputs
                templateConfigObj.outputs = scriptConfigs;
                templateConfigObj.scripts = null;
                dataSetFinalConfig.template_config = templateConfigObj;
                //now loop and generate                
                for (var template in templateFiles) {
                    var templateFile = templateFiles[template];
                    //look for a valid config
                    var scriptConf = dataSetFinalConfig.template_config.outputs.filter(function(conf) { return conf.script_name + ".mustache" == templateFiles[template] });
                    assert.strictEqual(scriptConf.length, 1, `1 config should be defined for ${templateFiles[template]} in the folder ${languageFolderPath}`);
                    //now let's generate it
                    var templatePath = languageFolderPath + "/" + templateFile;
                    var template_str = fs.readFileSync(templatePath, 'utf8');
                    var fc = exports.generate_file_content_from_template(template_str, dataSetFinalConfig, generatedFolder)
                    var outputFileDir = generatedFolder + "/" + templateLanguageConfig.language; 
                    if (!fs.existsSync(outputFileDir)) fs.mkdirSync(outputFileDir);                                   
                    exports.write_output(outputFileDir, fc, scriptConf[0]);
                }
            }

        }
        logger.info(`Templating finished for ${datasetToGenerate.name} | ${corrid}`);
    }
    logger.info(`All finished up, thanks for using the templator :). | ${corrid}`);
}

exports.mustache_recursive = function(TemplateStr, objectToApplyToTemplate, max_iter) {
    var templateString = TemplateStr;
    var i = 0;
    if (max_iter == null) max_iter = 5
    while (i <= max_iter || templateString.indexOf("{{") != -1) {
        templateString = Mustache.render(templateString, objectToApplyToTemplate)
        i++;
    }
    return templateString;
}

exports.resolve_global = function(global, datasetToGenerate) {
    //let's just apply mustache on the config so they can use anything in the dataset
    var template = JSON.stringify(datasetToGenerate);
    if (global != null) {
        logger.debug(`Global properties are defined. | ${corrid}`);
        datasetToGenerate.global = global;
    }
    var MustachedDatasetToGenerateString = Mustache.render(template, datasetToGenerate);
    return JSON.parse(MustachedDatasetToGenerateString);
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
 * 1. Combine Source and Target between parent and pattern implementation.
 * 2. Unify the source and target definitions for columns.
 * 3. Append last property and name without spaces property for columns, primary_keys, date_columns to help with generating strings in mustache.
 * 
 * @param {Object} datasetToGenerate The definition supplied for the dataset
 * @param {Object} templateLanguageConfig The definition for the pattern chosen for the dataset
 * @param {string} patternName The name of the pattern chosen to implement
 * @param {Object} global The global property set for all configs.
*/
exports.prepare_final_config = function(datasetToGenerate, templateLanguageConfig, patternName, global) {
    //now prepare the final config for the mustache template
    var dataSetFinalConfig = datasetToGenerate;
    //first let's flatten the source and target defined
    dataSetFinalConfig.source = {...datasetToGenerate.source, ...templateLanguageConfig.source};
    dataSetFinalConfig.target = {...datasetToGenerate.target, ...templateLanguageConfig.target};
    dataSetFinalConfig.language = templateLanguageConfig.language;
    dataSetFinalConfig.pattern = patternName;     
    if (templateLanguageConfig.properties == null) templateLanguageConfig.properties = {};
    dataSetFinalConfig.properties = templateLanguageConfig.properties;         
    //now for the arrays like columns and date_columns we need to add a last boolean to help with string generation
    assert.notStrictEqual(dataSetFinalConfig.source.columns, null, `It seems like you did not define any columns for the dataset. This is not allowed. Please provide either through samples or the config.`);
    assert.notStrictEqual(dataSetFinalConfig.source.columns.length, 0, `You cannot have 0 columns in a dataset.`);
    //Set the columns by unifying them into one defined set
    if (templateLanguageConfig.target.columns == null) templateLanguageConfig.target.columns = [];
    dataSetFinalConfig.columns = dataSetFinalConfig.source.columns.map(x => { 
        var scd = dataSetFinalConfig.source.columns.filter(y => y.name == x.name)[0];
        var tcd = templateLanguageConfig.target.columns.filter(y => y.name == x.name)[0];
        //apply global datatype mapping if it has been set in global
        if ((scd != null && scd.datatype) && (tcd == null || tcd.datatype == null) && (templateLanguageConfig.type_mapping != null)) {
            if (tcd == null) tcd = {};
            if (global != null && global.type_mappings != null) {
                var tm = global.type_mappings.filter(tmObj => tmObj.name == templateLanguageConfig.type_mapping)[0];
                assert.notStrictEqual(tm, null, `There was no type_mapping with the name ${templateLanguageConfig.type_mapping} found in the global definition.`);
                var tmDef = tm.definition;
                assert.notStrictEqual(tmDef, null, `There is no definition property defined for the type_mapping ${templateLanguageConfig.type_mapping}`);
                var targetType = global.type_mappings.filter(x => x.source == scd.datatype)[0];
                tcd = targetType == null ? tcd : {...tcd, ...{ datatype: targetType.target }};
            }
        }
        return {
            name: x.name,
            source: scd,
            hasSourceDefinition: scd != null ? true : false,
            target: tcd,
            hasTargetDefinition: tcd != null ? true : false
        }        
    });
    //now remove the column definitions from the source/target
    dataSetFinalConfig.source.columns = null;
    templateLanguageConfig.target.columns = null;
    //remove the spaces from the name and fix the last for all the arrays
    dataSetFinalConfig.source.date_columns = exports.remove_spaces_and_fix_last(dataSetFinalConfig.source.date_columns);
    dataSetFinalConfig.source.primary_key = exports.remove_spaces_and_fix_last(dataSetFinalConfig.source.primary_key);
    dataSetFinalConfig.columns = exports.remove_spaces_and_fix_last(dataSetFinalConfig.columns);    
    //now return it
    return dataSetFinalConfig;
}

/**
 * Configuring the array
 * 1. add a preprty with the names having spaces removed
 * 2. add a properry on the last item to indicate its the last
 * @param {Array} arr The array to be processed 
 */
exports.remove_spaces_and_fix_last = function(arr) {
    if (arr == null || arr.length == 0) return arr;
    arr[arr.length - 1].last = true;
    arr = arr.map(function(v) { v.name_without_spaces = v.name.replace(/ /g,"_"); return v; });
    return arr;
}

/**
 * Renders the files specified in the config to the file path specified in scripts_config.json.
 * 
 * @param {string} templateDefinition A string representation of the mustache content to put with the config.
 * @param {Object} configDefinition Flattened config generated from the original config specified by the user.
 */
exports.generate_file_content_from_template = function(templateDefinition, configDefinition){
    //so template it
    return exports.mustache_recursive(templateDefinition, configDefinition);     
}

/**
 * Output the content out to a script file
 * 
 * @param {*} outputContent 
 * @param {*} scriptConf 
 */
exports.write_output = function(outputFolder, outputContent, scriptConf) {
     
    //prepare the output folder if not present 
     if (scriptConf.output_file.sub_folder != null) {
        outputFolder += "/" + scriptConf.output_file.sub_folder;
         if (!fs.existsSync(outputFolder)) {
             fs.ensureDirSync(outputFolder);
         }
     }
     //write out the file
     var outputFileNameWithExt = scriptConf.output_file.name + "." + scriptConf.output_file.extension;                        
     var outputFilePath = outputFolder + "/" + outputFileNameWithExt;
     fs.writeFileSync(outputFilePath, outputContent);
     logger.info(`Outputted ${scriptConf.script_name} code to file ${outputFileNameWithExt} for implmentation. | ${corrid}`);
     logger.debug(`Exact path: ${path.resolve(outputFilePath)}. | ${corrid}`)
}
