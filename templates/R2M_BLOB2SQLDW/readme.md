#  Blob Storage to SQL Data warehouse
## Template family

This template is for moving data between Blob Storage and SQL Datawarehouse. All templates generate two pieces of code.

1. An Azure Data Factory json pipeline
2. A .sql file for a Stored Procedure

The templates are denoted with a prefix of R2M. It is mapped to an architecture that has 4 areas:
- **R**AW
- **M**AIN
- **E**NRICHED
- **B**USINESS

It should be noted for these set of templates that it does not include any orchestration to trigger the R2M pipeline that you deploy. You will need to design and implement that.

The templates included are:
- DL1: Drop and Recreate the target table with the incoming data
- DL2: Append the incoming data to the target table
- DL3: Update and Insert the incoming data into the target table, not keeping history

### Family Requirements

#### 1. External File Format and External Data Source defined in SQL Data warehouse
Templates require the following:
- The [external data source](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-external-data-source-transact-sql?view=sql-server-2017) defined in SQLDW pointing to the correct blob storage account
- The [external file format](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-external-file-format-transact-sql?view=sql-server-2017) defined in SQLDW for the incoming files to process.

#### 2. Decide on a distribution
SQL Datawarehouse being built with an MPP (massively parallel processing) based architecture places a large importance for the location of your data when queries are being performed. Suppose that you do a join between two datasets, if one dataset is majority on a node that is not close to the location of the other datasets on the nodes: SQL Datawarehouse will take time to transport the data to do the query. Whilst this is milliseconds, milliseconds to seconds can impact query times when looking for sub second query performance. Please refer to the documentation as to what distribution you should chose. 

The options at present (10/18/2018) are:
- [HASH vs ROUND_ROBIN](https://docs.microsoft.com/en-us/azure/sql-data-warehouse/sql-data-warehouse-tables-distribute)
- [REPLICATED](https://docs.microsoft.com/en-us/azure/sql-data-warehouse/design-guidance-for-replicated-tables) 


#### 3. Have a dataset in Azure Data Factory pointing to SQL DW
You will requrie a dataset in Data Factory that is pointing to the right SQL DW. The activity declared in Data Factory will then use this as a connection. It will not use the table if you have specified a table in the dataset.