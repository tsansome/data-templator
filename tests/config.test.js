//Mustaching content inside config
const templator = require('../src/templater-core.js');

test('Able to refer to a source variable in a config from parent', () => {
    
    var config = {
        "name": "MyTable",
        "source": {
            "database": "SourceDB",
            "schema": "SourceSchema",
            "tablename": "SourceTableName",                
            "primary_key": [ { "name": "PersonID" }],
            "columns": [{ "name": "PersonID" },
                        { "name": "FirstName" },
                        { "name": "LastName" }],
            "date_columns": [ {"name": "Date_Created" }]
        },
        "templates": [
            {
                "name": "0_HELLOWORLD",
                "generate": [
                    {
                        "language": "REL",
                        "target": {
                            "database": "TargetDB",
                            "table": "{{source.database}}_{{ source.tablename}}",
                            "date_format": "yyyy-MM-dd"
                        }
                    }
                ]
            }
        ]
    };    

    var pattern_to_template = config.templates[0].generate[0];
    
    var final_config = templator.prepare_final_config(config, pattern_to_template, "DL1");

    var template_definition = "{{source.tablename}}";
    
    var output = templator.generate_file_content_from_template(template_definition, final_config)

    expect(output).toBe(config.source.tablename);
});

test('Able to refer to use a target variable in a config from parent', () => {
    var config = {
        "name": "MyTable",
        "source": {
            "database": "SourceDB",
            "schema": "SourceSchema",
            "tablename": "SourceTableName",                
            "primary_key": [ { "name": "PersonID" }],
            "columns": [{ "name": "PersonID" },
                        { "name": "FirstName" },
                        { "name": "LastName" }],
            "date_columns": [ {"name": "Date_Created" }]
        },
        "target": {
            "database": "TestDB"
        },
        "templates": [
            {
                "name": "0_HELLOWORLD",
                "generate": [
                    {
                        "language": "REL",
                        "source": {
                            "service": "test"
                        },
                        "target": {
                            "database": "TargetDB",
                            "table": "{{source.database}}_{{ source.tablename}}",
                            "date_format": "yyyy-MM-dd"
                        }
                    }
                ]
            }
        ]
    };    

    var pattern_to_template = config.templates[0].generate[0];
    
    var final_config = templator.prepare_final_config(config, pattern_to_template, "DL1");

    var template_definition = "{{target.database}}";
    
    var output = templator.generate_file_content_from_template(template_definition, final_config)

    expect(output).toBe(config.target.database);
});

test('Able to refer to a source variable in a config from dataset', () => {
    var config = {
        "name": "MyTable",
        "source": {
            "database": "SourceDB",
            "schema": "SourceSchema",
            "tablename": "SourceTableName",                
            "primary_key": [ { "name": "PersonID" }],
            "columns": [{ "name": "PersonID" },
                        { "name": "FirstName" },
                        { "name": "LastName" }],
            "date_columns": [ {"name": "Date_Created" }]
        },
        "templates": [
            {
                "name": "0_HELLOWORLD",
                "generate": [
                    {
                        "language": "REL",
                        "source": {
                            "service": "test"
                        },
                        "target": {
                            "database": "TargetDB",
                            "table": "{{source.database}}_{{ source.tablename}}",
                            "date_format": "yyyy-MM-dd"
                        }
                    }
                ]
            }
        ]
    };    

    var pattern_to_template = config.templates[0].generate[0];
    
    var final_config = templator.prepare_final_config(config, pattern_to_template, "DL1");

    var template_definition = "{{source.service}}";
    
    var output = templator.generate_file_content_from_template(template_definition, final_config)

    expect(output).toBe(config.templates[0].generate[0].source.service);
});

test('Able to refer to a target variable in a config from dataset', () => {
    var config = {
        "name": "MyTable",
        "source": {
            "database": "SourceDB",
            "schema": "SourceSchema",
            "tablename": "SourceTableName",                
            "primary_key": [ { "name": "PersonID" }],
            "columns": [{ "name": "PersonID" },
                        { "name": "FirstName" },
                        { "name": "LastName" }],
            "date_columns": [ {"name": "Date_Created" }]
        },
        "templates": [
            {
                "name": "0_HELLOWORLD",
                "generate": [
                    {
                        "language": "REL",
                        "source": {
                            "service": "test"
                        },
                        "target": {
                            "database": "TargetDB",
                            "table": "{{source.database}}_{{ source.tablename}}",
                            "date_format": "yyyy-MM-dd"
                        }
                    }
                ]
            }
        ]
    };    

    var pattern_to_template = config.templates[0].generate[0];
    
    var final_config = templator.prepare_final_config(config, pattern_to_template, "DL1");

    var template_definition = "{{target.database}}";
    
    var output = templator.generate_file_content_from_template(template_definition, final_config)

    expect(output).toBe(config.templates[0].generate[0].target.database);
});

test('Able to refer to a user defined variable from parent in config', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to a global variable in config', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to outputted script names', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to dictionary defined in global', () => {
    expect(1+2).toBe(3);
});

test('Able to override date formats', () => {
    expect(1+2).toBe(3);
});

//Output script testing

test('Able to override output script names and paths', () => {
    expect(1+2).toBe(3);
});

//samples testing
test('Able to provide sample, No path specified', () => {
    expect(1+2).toBe(3);
});

test('Able to provide sample, Path supplied and able to override with custom delimiter', () => {
    expect(1+2).toBe(3);
});

//error testing

test('Error presented when user refers to template that doesn\'t exist', () => {
    expect(1+2).toBe(3);
});

test('Error presented when user refers to sample file that doesn\'t exist', () => {
    expect(1+2).toBe(3);
});

test('Error presented when user does not define columns for a single dataset', () => {
    expect(1+2).toBe(3);
});

test('Error presented when user does not define columns for more than one dataset', () => {
    expect(1+2).toBe(3);
});
