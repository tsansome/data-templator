#  Relational Database Management System (RDBMS) to Azure Databricks
## Template family

This template is for moving data between an RDBMS and Azure Databricks. All templates generate two pieces of code.

- An Azure Data Factory json pipeline
- A .ipynb file for a Python notebook

The templates are denoted with a prefix of R2M. It is mapped to an architecture that has 4 areas:
- **R**AW
- **M**ASTER
- **E**NRICHED
- **B**USINESS

Hence these templates are concerned with moving data between RAW and MASTER (R2M).

It should be noted for these set of templates that it does not include any orchestration to trigger the R2M pipeline that you deploy. You will need to design and implement that.

The templates included are:
- DL1: Drop and Recreate the target table with the incoming data

### Family Requirements

#### 1. Network connection to database
These templates will run the connection to the RDBMS with a live connection from Databricks. As of (10/16/2018) Databricks uses a JDBC connection to execute this. Because of this Databricks will require:
- Be able to talk to the target database over the network
    - Azure should work out of the box
    - For a local box ensure you have an Azure virtual machine in a virtual network that is connected to the network the database is sitting in. Azure Databricks should be set up as a peer to that virtual network. See here

#### 2. Connection string stored in an Azure Databricks Secret
It requires that you have a secret scope set up in databricks. For setting this up please go to () as a guide. In the scope, the connection string to connect to the RDBMS should be stored.
