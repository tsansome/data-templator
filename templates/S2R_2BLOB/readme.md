#  Oracle to Blob storage
## Template family

This template is for moving data between Oracle database and Blob Storage. All templates generate An Azure Data Factory json pipeline

The templates are denoted with a prefix of S2R. It is mapped to an architecture that has 4 areas:
- **R**AW
- **M**AIN
- **E**NRICHED
- **B**USINESS


The templates included are:
- DE1: Extract Full table from source to the target storage
- DE2: Extract Delta records (Newly created and/or modified) to the target storage

> Note: These set of templates does not include any orchestration to trigger the S2R pipeline that you deploy. it will be required to design and implement that.

### Family Requirements

#### 1. Have a dataset in Azure Data Factory pointing to Oracle
You will requrie a dataset in Data Factory that is pointing to the right SQL DW. The activity declared in Data Factory will then use this as a connection. It will not use the table if you have specified a table in the dataset.

#### 2. Have a dataset in Azure Data Factory pointing to Blob
You will requrie a dataset in Data Factory that is pointing to the right SQL DW. The activity declared in Data Factory will then use this as a connection. It will not use the table if you have specified a table in the dataset.


