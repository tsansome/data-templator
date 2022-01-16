# Raw To Master DL3 (Insert & Update) - Blob Storage to SQL Data warehouse
## SQL Stored procedure via Azure Data Factory

### Outputted Code

- An Azure Data Factory json pipeline
- A .sql file for a Stored Procedure

### Source atttributes required

This template requires you to define the primary keys of the dataset.

No additional attributes for source are required.

### Target attributes required

No attributes for target are required.

### Properties attributes required

Attribute Name | Description of Attribute
-------------- | ------------------------
datasource | The [external data source](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-external-data-source-transact-sql?view=sql-server-2017) defined in SQLDW pointing to the correct blob storage account.
fileformat | The [external file format](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-external-file-format-transact-sql?view=sql-server-2017) defined in SQLDW for the incoming files to process.
distribution | The type of distribution. Please refer to [here](https://docs.microsoft.com/en-us/azure/sql-data-warehouse/sql-data-warehouse-tables-distribute) as a guide for HASH vs ROUND_ROBIN. You may also set it to [REPLICATED](https://docs.microsoft.com/en-us/azure/sql-data-warehouse/design-guidance-for-replicated-tables). 
datatypeforcounttable | The type for the count of rows returned. If you have a very large table you might want to set BIGINT. Default is INT.
dummysource | An [Azure Data Factory Dataset](https://docs.microsoft.com/en-us/azure/data-factory/connector-azure-sql-data-warehouse) that points to the correct SQL Data warehouse resource.

### Json example

```json
{
    "properties": {
        "datasource": "mydatasource",
        "fileformat": "gzipdefined",
        "distribution": "ROUND_ROBIN"
    }
}
```