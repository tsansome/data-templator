# The Templator 

Migrating datasets or tables into some system? that's what this was originally built for. An experiment between some data engineers. A templating utility with in built templates, fed by a config and a minimal code footprint. Developer productivity here we come!

So welcome to the templator, be a consumer or even a pattern author. If you develop a new pattern, submit a pull request! 

## Getting Started
### Step 1. Define your config

The templator works off a config that you define. It should be JSON format and it should define a collection of datasets that you wish to template. See the samples folder for several config examples to teach you how to define the config.

### Step 2. Make use of Mustache

The templator uses [Mustache](https://www.npmjs.com/package/mustache) under the covers to use your config defined in step 1 and apply it to a script that a pattern author defines. 

Let's see an example of how we could use it. Suppose the pattern your wishing to template requires that you specify the target table to insert the data into. You know that the target table is going to be named the same as the source table name. We could define this in mustache with:

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

### Step 4. Run the templator

With your config defined, you can run the templator. 

from outside the repository run below:
```console
node .\data-templator\template.js -c [path_to_config_file_or_folder] -g [path_to_output_directory]
```

if you want to provide CSV samples instead of defining columns in config it would look like this
```console
node .\data-templator\template.js -c [path_to_config_file_or_folder] -g [path_to_output_directory] -s [path_to_sample_folder]
```

