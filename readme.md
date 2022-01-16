# The Templator 

Migrating datasets or tables into some system? that's what this was originally built for. An experiment between some data engineers. A templating utility with in built templates, fed by a config and a minimal code footprint. Developer productivity here we come!

So welcome to the templator, be a consumer or even a template author. If you develop a new template, submit a pull request! 

## Getting Started
### Step 1. Define your config

The templator works off a config that you define. It should be JSON format and it should define a collection of datasets that you wish to invoke templates for. See the examples folder for several config examples to teach you how to define the config.

### Step 2. Make use of Mustache

The templator uses [Mustache](https://www.npmjs.com/package/mustache) under the covers to use your config defined in step 1 and apply it to a template that a template author has defined. 

Let's see an example of how we could use it. Suppose the template your wishing to invoke requires that you specify the target table to insert the data into. You know that the target table is going to be named the same as the source table name. We could define this in mustache with:

```json
"target": {
  "tablename": "{{source.tablename}}"
}
```

as a bonus suppose we wanted to bring in the source database name as well, we could do

```json
"target": {
  "tablename": "{{source.database}}_{{source.tablename}}"
}
```

You can use mustache anywhere to call into different parts of your config. 

### Step 3. Say hello to Global Variables

The templator supports declaring variables globally in your config file. In this way you would have structure for your config that looks like this:

```json
{
  "config_file": "Templator",
  "datasets": [],
  "global": {
    "date_format": "YYYY/MM/DD"
  }
}
```
This can be very useful for declaring variables that you can use across all your datasets. Suppose we wanted to reference that date_format described above, we would simply do

```json
{
  "generate": [
    {
      "language": "IPYNB",
      "source": {
         "default_date_format": "{{global.date_format}}"
      }
    }
  ]
}
```

### Step 4. Do you need to reference one of the outputted files?
If in the config an attribute asks for the name of the file that was outputted e.g. an orchestration config setting may require the name of the file outputted by the templator: You can simply refer to it by placing a mustache variable 

{{ template_config.outputs.[index_of_output].output_file.name }}

An example where we refer to the first outputted file:

```json
{
  "generate": [
    {
      "language": "IPYNB",
      "source": {
         "default_date_format": "{{global.date_format}}"
      },
      "properties": {
        "notebookpath": "/Shared/{{ template_config.outputs.0.output_file.name }}"
      }
    }
  ]
}
```

### Step 5. Run the templator

With your config defined, you can run the templator. 

from outside the repository run below:
```console
node .\data-templator\template.js -c [path_to_config_file_or_folder] -o [path_to_output_directory]
```

if you want to provide CSV samples instead of defining columns in config it would look like this
```console
node .\data-templator\template.js -c [path_to_config_file_or_folder] -o [path_to_output_directory] -s [path_to_sample_folder]
```

