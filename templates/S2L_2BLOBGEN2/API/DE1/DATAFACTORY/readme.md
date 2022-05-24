# Source to Raw DE1 (Full table) - Azure SQL to Azure Blob Storage

Selects all the columns from the source Oracle database to be extracted and dump the data on to Azure Blob storage

### Outputted Code

- An Azure Data Factory json pipeline

### Source atttributes required

Attribute Name | Description of Attribute
-------------- | ------------------------
database | The name of the service for the api.
tablename | The name of the endpoint being extracted
retrieverlinkedservice | The name of the linked service pointing to the api retriever.

### Target attributes required

No target attributes required, built into api retriever.

### Properties attributes required

No additional attributes for source are required.

### Json example

```json
{
   "language": "DATAFACTORY",
    "properties": {},
    "source": {
        "database": "CIN7",
        "tablename": "Stock",
        "retrieverlinkedservice": "LS_AZ_FUNC"
    },
    "target": { } 
}
```