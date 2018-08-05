# Example configs

This folder has a selection of examples for defining configs.

## 0. Config
url: [0_config.json](0_config.json)
This sample is a vanilla config.

## 1. Config using mustache
url: [0_config_using_mustache.json](1_config_using_mustache.json)
An example config that makes use of mustache inside the config to avoid repeating segments.

## 2. Config using mustache and two datasets
url: [1_config_using_mustache_two_datasets.json](2_config_using_mustache_two_datasets.json)
An example config with two datasets. It also uses mustache to avoid repeating code.

## 3. Config using globals
url: [2_config_using_globals.json](3_config_using_mustache_two_datasets.json)
With two datasets being defined they often have common code between them. This sample makes use of global variables to define two common attributes of source database and default date format.

## 4. Config using samples
url: [4_config_using_samples_default_delimeter.json](4_config_using_samples_default_delimeter.json)
This example shows how a config should be declared that uses samples instead of defining the columns within the config.

## 5. Config using samples
url: [5_config_using_samples_custom_delimeter.json](5_config_using_samples_custom_delimeter.json)
With using samples sometimes there is a need to define a custom delimeter. 