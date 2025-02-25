const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const ExcelJS = require("exceljs");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increase payload limit

const pools = {};

async function createPools() {
  pools.db1 = new sql.ConnectionPool(dbConfig.db1Config);
  pools.db2 = new sql.ConnectionPool(dbConfig.db2Config);
  pools.db3 = new sql.ConnectionPool(dbConfig.db3Config);

  try {
    await pools.db1.connect();
    console.log("Connected to db1");
  } catch (err) {
    console.error("Failed to connect to db1:", err.message);
  }

  try {
    await pools.db2.connect();
    console.log("Connected to db2");
  } catch (err) {
    console.error("Failed to connect to db2:", err.message);
  }
  try {
    await pools.db3.connect();
    console.log("Connected to db3");
  } catch (err) {
    console.error("Failed to connect to db3:", err.message);
  }
}

createPools();

app.post("/execute-sql", async (req, res) => {
  const { db, sql: query } = req.body;

  if (!pools[db]) {
    return res.status(400).send("Invalid database");
  }

  try {
    console.log(`Executing query on ${db}: ${query.length} characters`, query); // Log the length of the query
    const result = await pools[db].request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error executing query:", error); // Log detailed error
    res.status(500).send(error.message);
  }
});

app.post("/generate-excel", async (req, res) => {
  const { db, sql: query } = req.body;

  if (!pools[db]) {
    return res.status(400).send("Invalid database");
  }

  try {
    const result = await pools[db].request().query(query);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Results");

    // Add column headers
    worksheet.columns = Object.keys(result.recordset[0]).map((key) => ({
      header: key,
      key,
    }));

    // Add rows
    result.recordset.forEach((row) => {
      worksheet.addRow(row);
    });

    // Generate Excel file
    res.setHeader("Content-Disposition", "attachment; filename=results.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/get-user-company", async (req, res) => {
  try {
    // Ensure the db1 pool is initialized
    if (!pools.db1) {
      return res.status(500).send("Database connection is not initialized.");
    }

    // Define the query for UserCompany
    const query = `
      SELECT DISTINCT LTRIM(RTRIM([FineUserID])) AS FineUserID
      FROM [reporting].[dbo].[UserCompany]

    `;
    // Execute the query on the db3 pool
    const result = await pools.db3.request().query(query);

    // Send the result as JSON
    res.json(result.recordset);
  } catch (error) {
    console.error("Error querying UserCompany:", error);
    res.status(500).send("An error occurred while querying the database.");
  }
});

app.get("/get-user-company-old", async (req, res) => {
  try {
    // Ensure the db3 pool is initialized
    if (!pools.db3) {
      return res.status(500).send("Database connection is not initialized.");
    }

    // Define the query for UserCompany
    const query = `
      SELECT [FineUserID], [CompID], [CompName], [CompShort], [DefaultComp]
      FROM [reporting].[dbo].[UserCompany]
    `;

    // Execute the query on the db3 pool
    const result = await pools.db3.request().query(query);

    // Send the result as JSON
    res.json(result.recordset);
  } catch (error) {
    console.error("Error querying UserCompany:", error);
    res.status(500).send("An error occurred while querying the database.");
  }
});

app.get("/get-companies", async (req, res) => {
  try {
    if (!pools.db3) {
      return res.status(500).send("Database connection is not initialized.");
    }
    // Query for distinct company numbers and names.
    const query = `
      select company,name from erp.Company
    `;
    const result = await pools.db3.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error querying companies:", error);
    res.status(500).send("An error occurred while querying the companies.");
  }
});

app.get("/get-companies-old", async (req, res) => {
  try {
    if (!pools.db3) {
      return res.status(500).send("Database connection is not initialized.");
    }
    // Query for distinct company numbers and names.
    const query = `
      SELECT DISTINCT [CompID], [CompName]
      FROM [reporting].[dbo].[UserCompany]
      ORDER BY [CompID]
    `;
    const result = await pools.db3.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error querying companies:", error);
    res.status(500).send("An error occurred while querying the companies.");
  }
});

app.get("/get-user-short", async (req, res) => {
  try {
    // Ensure the db1 pool is initialized
    if (!pools.db1) {
      return res.status(500).send("Database connection is not initialized.");
    }

    // Define the query for UserCompany
    const query = `
SELECT DISTINCT 
  LTRIM(RTRIM(CompShort)) AS ShortCode,
  LTRIM(RTRIM(CompId)) AS CompId
FROM [reporting].[dbo].[UserCompany]
WHERE LTRIM(RTRIM(CompShort)) <> ''
  AND CompShort IS NOT NULL;
    `;
    // Execute the query on the db3 pool
    const result = await pools.db3.request().query(query);

    // Send the result as JSON
    res.json(result.recordset);
  } catch (error) {
    console.error("Error querying UserCompany:", error);
    res.status(500).send("An error occurred while querying the database.");
  }
});
