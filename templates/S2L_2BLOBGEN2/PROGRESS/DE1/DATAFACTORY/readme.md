# Source to Raw DE1 (Full table) - Oracle to Azure Blob Storage

Selects all the columns from the source Oracle database to be extracted and dump the data on to Azure Blob storage

### Outputted Code

- An Azure Data Factory json pipeline


### Source atttributes required

Attribute Name | Description of Attribute
-------------- | ------------------------
genericdataset | A Data Factory dataset that points to the source Oracle database. It does not need to point to the table as a select statement will be passed through.

### Target attributes required

Attribute Name | Description of Attribute
-------------- | ------------------------
storage_container | Azure storage container name where the table will be droped at.
genericdataset | A Data Factory dataset that points to the target Azure Blob storage. 


### Properties attributes required

No additional attributes for source are required.

### Json example

```json
{
   "language": "DATAFACTORY",
    "properties": {},
    "source": {
        "genericdataset": "myGenericDataSet_source"
    },
    "target": {
        "genericdataset": "myGeneraricDataSet_target",
        "storage_container": "myStorageContainer"
    } 
}
```