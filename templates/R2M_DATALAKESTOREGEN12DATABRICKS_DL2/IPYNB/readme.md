# Raw To Master DL2 (Append) - Data Lake Store Gen 1 to DataBricks
## Python Notebook - ipynb

### Source atttributes required

Note that this template only needs to know the columns and date columns. Does not require the primary keys of the dataset.

Attribute Name | Description of Attribute
-------------- | ------------------------
client_id | TBC
client_credential | TBC
tenant_id | TBC
raw_folder | The folder in data lake storage that the incoming files are stored in.
datalakestore_accountname | The name of the data lake storage account that databricks should point to.
date_locale | The format of the dates in the incoming file, specified in a valid Databricks Date Timestamp.

### Target attributes required

Attribute Name | Description of Attribute
-------------- | ------------------------
database | The target Databricks database for the resultant table to go in.
tablename | The target table that the data should be inserted into.

### Properties attributes required

Attribute Name | Description of Attribute
-------------- | ------------------------
notebook_path | The path that the resultant jupyter notebook in databricks.

### Json example

```json
{
    "source": {
        "client_id": ,
        "client_credential": ,
        "tenant_id": ,
        "raw_folder": "Finance",
        "datalakestore_accountname": "dls01",
        "date_locale": "YYYY/MM/DD"
    }, 
    "target": {
        "database": "Finance_master",
        "tablename": "Invoice"
    },
    "properties": {
        "notebook_path": "/Shared/Opertional/Invoice_DL1.ipynb"
    }
}
```