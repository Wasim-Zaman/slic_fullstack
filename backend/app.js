const express = require("express");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");

const CustomError = require("./exceptions/customError");
const swaggerSpec = require("./config/swagger");
const response = require("./utils/response");
const itemCodesRoutes = require("./routes/tblItemCodes1S1Br");
const userRoutes = require("./routes/TblUsers");
const foreignPORoutes = require("./routes/tblPOFPOMaster");
const locationsCompaniesRoutes = require("./routes/locationCompany");
const lineItemsRoutes = require("./routes/TblIPOFPODetails");
const customerNamesRoutes = require("./routes/TblCustomerNames");
const salesOrdersRoutes = require("./routes/tblFSOMaster");
const transactionsRoutes = require("./routes/TrxCodesType");
const slicuat05apiRoutes = require("./routes/slicuat05api");
const zatcaRoutes = require("./routes/zatcaRoutes");
const rolesRoutes = require("./routes/tblAppRoles");
const invoiceRoutes = require("./routes/invoice");
const exchangeInvoiceRoutes = require("./routes/TblSalesExchangeInvoicetmp");
const whatsappRoutes = require("./routes/whatsappRoutes.js");
const languageRoutes = require("./routes/languageRoute.js")
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
app.use("/api/roles", rolesRoutes);
app.use("/api/zatca", zatcaRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/exchangeInvoice", exchangeInvoiceRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/language",languageRoutes )
app.use((req, res, next) => {
  const error = new CustomError(`No route found for ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.log(error);
  let status = 500;
  let message =
    "An error occurred while trying to process your request. Please try again later.";
  let data = null;
  let success = false;

  if (error instanceof CustomError) {
    status = error.statusCode || 500;
    message = error.message || message;
    data = error.data || null;
  }

  res.status(status).json(response(status, success, message, data));
});

app.listen(port, function () {
  console.log("Server is running on port " + port);
});
