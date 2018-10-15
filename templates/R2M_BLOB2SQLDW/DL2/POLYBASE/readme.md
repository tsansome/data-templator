# Raw To Master DL2 (Append) - Blob Storage to SQL Data warehouse
## SQL Stored procedure 

### Source atttributes required

Note that this template only needs to know the columns and date columns. Does not require the primary keys of the dataset.

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