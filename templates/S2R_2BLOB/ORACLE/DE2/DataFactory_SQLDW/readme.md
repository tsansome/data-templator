# Source to Raw DE2 (Delta extract) - Oracle to Azure Blob Storage

Creates a pipeline that extracts the delta of newly created and/or modified  rows from a specified table from the specified database by comparing it to a table in the target database using the Dataset reference of an Oracle database in Data Factory. It then drops it into the Azure Blob storage.

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
    "language": "DATAFACTORY_SQLDW",
    "source": {
        "genericdataset": "myGenericDataSet_source"
    },
    "target": {
        "genericdataset": "myGenericDataSet_target",
        "storage_container": "myStorageContainer"
    },
    "properties": {
        "sqldwsource": "mySQLDWDatasource"
    }
}
```