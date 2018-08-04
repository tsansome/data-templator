# The Templator 

This utility was born out of the same frustration that most data engineers face today. Migrating 200 tables out of some system or even just repeating the same load script every new dataset your acquiring is tedious to do it one by one. This was the result of an experiment between some data engineers.

Welcome to the templator, can't wait to see the feedback but let's get into how to use it.

## For the consumer
### Step 1. Define your config

The templator works off a config that you define. It should be JSON format and it should define a collection of datasets that you wish to template. See the samples folder for several config examples to teach you how to define the config.

### Step 2. Make use of Mustache

The templator uses Mustache under the covers to use your config defined in step 1 and apply it to a script that a pattern author defines. To find detailed instructions on mustache go here.

Let's see an example of how we could use it. Suppose the pattern your wishing to template requires that you specify the target table to insert the data into. You know that the target table is going to be named the same as the source table name. WE could define this with mustache with:

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

### Step 3. Make use of globally defined values in your config

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

from outside the repository run below:
node .\data-templator\template.js -c <FILE_OR_FOLDER_PATH_TO_CONFIG> -g <FILE_OR_FOLDER_PATH_TO_OUTPUT>

if you want to provide CSV samples instead of defining columns in config it would look like this
node .\data-templator\template.js -c <FILE_OR_FOLDER_PATH_TO_CONFIG> -g <FILE_OR_FOLDER_PATH_TO_OUTPUT> -s <FILE_OR_FOLDER_PATH_TO_SAMPLES>

