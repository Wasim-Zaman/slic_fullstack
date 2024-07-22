const express = require("express");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");

const swaggerSpec = require("./config/swagger");
const generateResponse = require("./utils/response");
const itemCodesRoutes = require("./routes/tblItemCodes1S1Br");
const userRoutes = require("./routes/TblUsers");
const foreignPORoutes = require("./routes/tblPOFPOMaster");
const locationsCompaniesRoutes = require("./routes/locationCompany");
const lineItemsRoutes = require("./routes/TblIPOFPODetails");
const customerNamesRoutes = require("./routes/TblCustomerNames");
const salesOrdersRoutes = require("./routes/tblFSOMaster");
const transactionsRoutes = require("./routes/TrxCodesType");
const slicuat05apiRoutes = require("./routes/slicuat05api");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add your routes...
app.use("/api/itemCodes", itemCodesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/foreignPO", foreignPORoutes);
app.use("/api/locationsCompanies", locationsCompaniesRoutes);
app.use("/api/lineItems", lineItemsRoutes);
app.use("/api/customerNames", customerNamesRoutes);
app.use("/api/salesOrders", salesOrdersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/slicuat05api", slicuat05apiRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  const error = new Error(`No route found for ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message =
    error.message ||
    "An error occurred while trying to process your request. Please try again later.";
  const data = null;
  const success = false;
  res.status(status).json(generateResponse(status, success, message, data));
});

app.listen(port, function () {
  console.log("Server is running");
});
