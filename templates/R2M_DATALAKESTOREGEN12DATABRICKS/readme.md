#  Data Lake Store Generation 1 to Databricks
## Template family

This template is for moving data between Data Lake Storage Gen 1 and Databricks. All templates generate two pieces of code.

1. An Azure Data Factory json pipeline
2. A .ipynb file for a Python notebook

The templates are denoted with a prefix of R2M. It is mapped to an architecture that has 4 areas:
- **R**AW
- **M**ASTER
- **E**NRICHED
- **B**USINESS

Hence these templates are concerned with moving data between RAW and MASTER (R2M).

It should be noted for these set of templates that it does not include any orchestration to trigger the R2M pipeline that you deploy. You will need to design and implement that..

The templates included are:
- DL1: Drop and Recreate the target table with the incoming data
- DL2: Append the incoming data to the target table
- DL3: Update and Insert the incoming data into the target table, not keeping history
- DL4: Update and Insert the incoming data into the target table, preserve history in a history change table

### Family Requirements

There are no family requirements. Please refer to each template for their individual requirements.
