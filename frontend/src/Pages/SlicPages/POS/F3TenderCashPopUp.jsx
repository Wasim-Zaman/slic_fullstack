import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";
import newRequest from "../../../utils/userRequest";

const F3TenderCashPopUp = ({
  isVisible,
  setVisibility,
  storeDatagridData,
  showOtpPopup,
  handleClearData,
  selectedSalesType,
  handleInvoiceGenerator,
  totalAmountWithVat,
  invoiceHeaderData,
  handleClearInvoiceData,
  mobileNo,
  customerName,
  remarks,
  selectedCustomerCode,
  selectedTransactionCode,
  invoiceNumber,
  storeInvoiceDatagridData,
  isExchangeClick,
  selectedRowData,
  exchangeData,
  isExchangeDSalesClick,
  dSalesNoInvoiceexchangeData,
  DSalesNoInvoiceData,
  selectedCustomeNameWithDirectInvoice,
  // net withVat porps
  netWithVat,
  // net without exchange porps
  netWithOutVatExchange,
  totolAmountWithoutExchange,
  // net without dSales exchange props
  netWithOutVatDSalesNoInvoice,
  totolAmountWithoutVatDSalesNoInvoice,
  insertInvoiceRecord,

  // document no state
  setDirectSalesInvoiceDocumentNo,
  setDirectSalesReturnDocumentNo,
  setDSalesNoInvoice,
  handleDocumentNoUpdate,
  selectedSalesReturnType,
  searchInvoiceNumber,
  handleZatcaInvoiceGenerator,
}) => {
  const [loading, setLoading] = useState(false);
  const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState("");
  const [bankApprovedCode, setBankApprovedCode] = useState("");
  const grossAmount = totalAmountWithVat;

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [token, setToken] = useState(null);
  const [slicUserData, setSlicUserData] = useState(null);
  const PaymentModels = sessionStorage.getItem("selectedPaymentModels");
  const paymentModes = JSON.parse(PaymentModels);
  const ExamptionReason = sessionStorage.getItem("selectedExamptionReason");
  const examptReason = ExamptionReason ? JSON.parse(ExamptionReason) : "";
  
  
  useEffect(() => {
    // slic login api token get
    const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
    setToken(token);
    
    const storedCompanyData = sessionStorage.getItem("selectedCompany");
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      if (JSON.stringify(companyData) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(companyData);
        // console.log(companyData);
      }
    }
    
    const storedLocationData = sessionStorage.getItem("selectedLocation");
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
        // console.log(locationData);
      }
    }
  }, []);


   useEffect(() => {
    // slic our user data
    const slicUser = sessionStorage.getItem('slicUserData');
    const adminData = JSON.parse(slicUser);
    if (JSON.stringify(adminData) !== JSON.stringify(slicUserData)) {
      setSlicUserData(adminData?.data?.user);
      // console.log(adminData?.data?.user)
    }
    }, []);
  
    // console.log(slicUserData?.SalesmanCode);
    // console.log(examptReason)
    
    useEffect(() => {
      if (isVisible) {
        // console.log("Popup Data:", storeDatagridData);
        console.log("Invoice Data:", storeInvoiceDatagridData);
      // console.log("exchange Button", isExchangeClick)
      // console.log("Exchange DSales Button", isExchangeDSalesClick)
      // console.log(selectedCustomerCode?.CUSTOMERCODE)
      // console.log(selectedCustomeNameWithDirectInvoice?.CUST_CODE)
      // console.log(selectedTransactionCode?.TXN_CODE)
      // console.log(selectedRowData)

      console.log(netWithVat);
      console.log(netWithOutVatExchange);
      console.log(totolAmountWithoutExchange);
      console.log(netWithOutVatDSalesNoInvoice);
      // console.log(totolAmountWithoutVatDSalesNoInvoice)

      // console.log(exchangeData)

      // console.log("DSales Data", DSalesNoInvoiceData)
      // console.log("Header Data", invoiceHeaderData)
      console.log(dSalesNoInvoiceexchangeData);

      // console.log(selectedSalesReturnType)
      // console.log(searchInvoiceNumber)
      // console.log(examptReason);
    }
  }, [isVisible, storeDatagridData]);

  useEffect(() => {
    // Calculate change whenever cashAmount or grossAmount changes
    const calculatedChange = cashAmount - grossAmount;
    setChangeAmount(calculatedChange > 0 ? calculatedChange : 0);
  }, [cashAmount, grossAmount]);

  const handleSubmitDirectSalesInvoice = async () => {
    setLoading(true);

    try {
      const items = storeDatagridData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));

      const selectTransactionCode = selectedTransactionCode?.TXN_CODE;

      const salesInvoiceBody = {
        keyword: "Invoice",
        "secret-key": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        data: [
          {
            Company: "SLIC",
            TransactionCode: `${selectTransactionCode}`,
            CustomerCode: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
            // "CustomerCode": "EX100003",
            SalesLocationCode: selectedLocation?.stockLocation,
            DeliveryLocationCode: selectedLocation?.stockLocation,
            UserId: "SYSADMIN",
            CustomerName: customerName,
            MobileNo: mobileNo,
            Remarks: remarks,
            PosRefNo: invoiceNumber,
            ZATCAPaymentMode: paymentModes.code,
            TaxExemptionReason: examptReason?.name || "",
            SalesmanCode: slicUserData?.SalesmanCode,
            Item: items,
          },
        ],

        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "INVOICE",
        LANG: "ENG",
      };

      console.log(salesInvoiceBody);

      const res = await ErpTeamRequest.post(
        "/slicuat05api/v1/postData",
        salesInvoiceBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Sales Invoice Response:", res?.data);

      const documentNo = res?.data?.message?.["Document No"];
      const headSysId = res?.data?.message?.["Ref-No/SysID"];

      // If either documentNo or headSysId is missing, show an error and don't proceed
      if (!documentNo) {
        toast.error("Error in Sales Invoice API: Missing Document No");
        setLoading(false);
        return;
      }

      if (documentNo || headSysId) {
        handleDocumentNoUpdate(documentNo, headSysId, "DIRECT SALES INVOICE");
      }
      // Call insertInvoiceRecord with both documentNo and headSysId
      insertInvoiceRecord(documentNo, headSysId);

      // Call the Bank API after successful sales invoice
      if (paymentModes.code === "4" || paymentModes.code === "5") {
        const documentNo = res?.data?.message?.["Document No"];
        const bankReceiptBody = {
          _keyword_: "BANKRCPTDI",
          "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
          data: [
            {
              Company: "SLIC",
              UserId: "SYSADMIN",
              Department: "011",
              TransactionCode: "BRV",
              Division: "100",
              BankApproverCode: bankApprovedCode,
              CashCardFlag: "CARD",
              ReceiptAmt: totalAmountWithVat,
              CustomerId: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
              MatchingTransactions: [
                {
                  DocNo: documentNo,
                  TransactionCode: selectTransactionCode,
                  PendingAmount: totalAmountWithVat,
                  AdjAmount: totalAmountWithVat,
                },
              ],
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "BANKRECEIPTVOUCHER",
          LANG: "ENG",
        };

        console.log(bankReceiptBody);

        const bankRes = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          bankReceiptBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Bank Receipt for Sales Invoice processed");
        const bankDocumentNo = bankRes?.data?.message?.["Document No"];

        // If bankDocumentNo is missing, show an error and stop
        if (!bankDocumentNo) {
          toast.error("Error in Bank API: Missing Document No");
          setLoading(false);
          return;
        }
      }

      showOtpPopup(res?.data);
      handleCloseCreatePopup();
      // handleClearData();
      // handleClearInvoiceData();
      handleInvoiceGenerator();
      setLoading(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  // Archive Api I call their
  const handleArchiveInvoice = async () => {
    try {
      const itemsToReturn = storeInvoiceDatagridData.map((item) => ({
        id: item.id,
        qtyToReturn: item.Qty, // Adjust this as per your data structure
      }));

      const resInvoiceArchive = await newRequest.post(
        "/invoice/v1/archiveInvoice",
        {
          invoiceNo: searchInvoiceNumber,
          itemsToReturn,
        }
      );

      // console.log("Archive Invoice Response:", resInvoiceArchive.data);
      toast.success(
        resInvoiceArchive?.data?.message || "Invoice archived successfully"
      );
    } catch (err) {
      // console.error("Error archiving invoice:", err);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Error In Archived The Data"
      );
    }
  };

  const handleSubmitDirectSalesReturn = async () => {
    setLoading(true);
    console.log("Direct Sales Return Data", exchangeData);
    try {
      const firstDataGridItem = exchangeData.map((item) => ({
        "Item-Code": item.SKU || item.ItemCode,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));

      const SecondDataGridItem = storeInvoiceDatagridData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));

      const selectTransactionCode = selectedTransactionCode?.TXN_CODE;
      const modifiedTransactionCode = selectTransactionCode.slice(0, -2) + "IN";

      // Body for the sales return (EXSR)
      const salesReturnBody = {
        _keyword_: "salesreturn",
        "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        data: [
          {
            Company: "SLIC",
            TransactionCode: selectTransactionCode,
            CustomerCode:
              selectedSalesReturnType === "DIRECT RETURN"
                ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                : selectedCustomerCode?.CUSTOMERCODE,
            SalesLocationCode: selectedLocation?.stockLocation,
            DeliveryLocationCode: selectedLocation?.stockLocation,
            UserId: "SYSADMIN",
            CustomerName: invoiceHeaderData?.CustomerCode,
            MobileNo: invoiceHeaderData?.MobileNo,
            Remarks: invoiceHeaderData?.Remarks,
            PosRefNo: invoiceHeaderData?.InvoiceNo,
            ZATCAPaymentMode: paymentModes.code,
            TaxExemptionReason: examptReason?.name || "",
            SalesmanCode: slicUserData?.SalesmanCode,
            Item: SecondDataGridItem,
          },
        ],
        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "SALESRETURN",
        LANG: "ENG",
      };

      if (isExchangeClick) {
        // Exchange scenario: Call both Sales Return and Invoice APIs
        const exsrRes = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          salesReturnBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Sales Return Response (EXSR):", exsrRes?.data);

        const exsrDocumentNo = exsrRes?.data?.message?.["Document No"];
        if (!exsrDocumentNo) {
          toast.error("Error in Sales Return API: Missing Document No");
          setLoading(false);
          return;
        }

        // Body for the invoice (EXIN)
        const salesInvoiceBody = {
          _keyword_: "Invoice",
          "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
          data: [
            {
              Company: "SLIC",
              TransactionCode: modifiedTransactionCode,
              CustomerCode:
                selectedSalesReturnType === "DIRECT RETURN"
                  ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                  : selectedCustomerCode?.CUSTOMERCODE,
              SalesLocationCode: selectedLocation?.stockLocation,
              DeliveryLocationCode: selectedLocation?.stockLocation,
              UserId: "SYSADMIN",
              CustomerName: invoiceHeaderData?.CustomerCode,
              MobileNo: invoiceHeaderData?.MobileNo,
              Remarks: invoiceHeaderData?.Remarks,
              PosRefNo: invoiceHeaderData?.InvoiceNo,
              ZATCAPaymentMode: paymentModes.code,
              TaxExemptionReason: examptReason?.name || "", // Invoice specific field
              SalesmanCode: slicUserData?.SalesmanCode,
              Item: firstDataGridItem,
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "INVOICE",
          LANG: "ENG",
        };

        // Call the Invoice API (EXIN)
        const exinRes = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          salesInvoiceBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Invoice Response (EXIN):", exinRes?.data);

        const exinDocumentNo = exinRes?.data?.message["Document No"];

        if (!exinDocumentNo) {
          toast.error("Error in Invoice API: Missing Document No");
          setLoading(false);
          return;
        }

        const documentNo = exinRes?.data?.message["Document No"];
        const headSysId = exinRes?.data?.message["Ref-No/SysID"];
        if (documentNo || headSysId) {
          handleDocumentNoUpdate(documentNo, headSysId, "DIRECT SALES RETURN");
        }

        insertInvoiceRecord(documentNo);

        // after the Success response of return ERP api i call our own Archive Api
        await handleArchiveInvoice();

        // Call Bank API for Exchange (EXSR + EXIN) Call Bank API for Exchange only if paymentModes.code === "4" or "5"
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const bankReceiptBody = {
            _keyword_: "BANKRCPTEX",
            "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
            data: [
              {
                Company: "SLIC",
                UserId: "SYSADMIN",
                Department: "011",
                TransactionCode: "BRV",
                Division: "100",
                BankApproverCode: bankApprovedCode,
                CashCardFlag: "CARD",
                ReceiptAmt: totalAmountWithVat - totolAmountWithoutExchange,
                CustomerId:
                  selectedSalesReturnType === "DIRECT RETURN"
                    ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                    : selectedCustomerCode?.CUSTOMERCODE,
                MatchingTransactions: [
                  {
                    DocNo: exinDocumentNo,
                    TransactionCode: modifiedTransactionCode,
                    PendingAmount: totalAmountWithVat,
                    AdjAmount: totalAmountWithVat,
                  },
                  {
                    DocNo: exsrDocumentNo,
                    TransactionCode: selectTransactionCode,
                    PendingAmount: totolAmountWithoutExchange,
                    AdjAmount: totolAmountWithoutExchange,
                  },
                ],
              },
            ],
            COMPANY: "SLIC",
            USERID: "SYSADMIN",
            APICODE: "BANKRECEIPTVOUCHER",
            LANG: "ENG",
          };

          const bankRes = await ErpTeamRequest.post(
            "/slicuat05api/v1/postData",
            bankReceiptBody,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Bank Receipt processed for Exchange");

          const bankDocumentNo = bankRes?.data?.message?.["Document No"];

          // If bankDocumentNo is missing, show an error and stop
          if (!bankDocumentNo) {
            toast.error("Error in Bank API: Missing Document No");
            setLoading(false);
            return;
          }
        } else {
          console.log("No Bank API call for Exchange (Non-card/cash payment)");
        }

        showOtpPopup(exsrRes?.data);
        handleCloseCreatePopup();
        handleInvoiceGenerator();
        handleZatcaInvoiceGenerator();
        setLoading(false);
      } else {
        // Non-exchange scenario: Only call Sales Return API
        const res = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          salesReturnBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Sales Return Response:", res?.data);

        const documentNo = res?.data?.message["Document No"];
        const headSysId = res?.data?.message["Ref-No/SysID"];
        if (!documentNo) {
          toast.error("Error in Sales Return API: Missing Document No");
          setLoading(false);
          return;
        }

        if (documentNo || headSysId) {
          handleDocumentNoUpdate(documentNo, headSysId, "DIRECT SALES RETURN");
        }

        // insertInvoiceRecord(documentNo);

        // Our Api
        await handleArchiveInvoice();

        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        // handleClearData();
        // handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);

        // For Direct Sales Return Debit/Credit (paymentModes.code === 4 or 5)
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const documentNo = res?.data?.message["Document No"];
          const bankReceiptDI = {
            _keyword_: "BANKRCPTDI",
            "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
            data: [
              {
                Company: "SLIC",
                UserId: "SYSADMIN",
                Department: "011",
                TransactionCode: "BRV",
                Division: "100",
                BankApproverCode: bankApprovedCode,
                CashCardFlag: "CARD",
                ReceiptAmt: totolAmountWithoutExchange,
                CustomerId:
                  selectedSalesReturnType === "DIRECT RETURN"
                    ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                    : selectedCustomerCode?.CUSTOMERCODE,
                MatchingTransactions: [
                  {
                    DocNo: documentNo,
                    TransactionCode: selectTransactionCode,
                    PendingAmount: totolAmountWithoutExchange,
                    AdjAmount: totolAmountWithoutExchange,
                  },
                ],
              },
            ],
            COMPANY: "SLIC",
            USERID: "SYSADMIN",
            APICODE: "BANKRECEIPTVOUCHER",
            LANG: "ENG",
          };

          const bankRes = await ErpTeamRequest.post(
            "/slicuat05api/v1/postData",
            bankReceiptDI,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const bankDocumentNo = bankRes?.data?.message?.["Document No"];

          // If bankDocumentNo is missing, show an error and stop
          if (!bankDocumentNo) {
            toast.error("Error in Bank API: Missing Document No");
            setLoading(false);
            return;
          }

          // Complete the process
          showOtpPopup(bankRes?.data);
          handleCloseCreatePopup();
          // handleClearData();
          // handleClearInvoiceData();
          handleInvoiceGenerator();
          setLoading(false);
          console.log(
            "Bank Receipt processed for Direct Sales Return Debit/Credit"
          );
        } else {
          console.log("Direct Sales Return - Cash (No Bank API Call)");
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  // Archive Api I call their
  // const handleDSalesArchiveInvoice = async () => {
  //   try {
  //     const itemsToReturn = DSalesNoInvoiceData.map(item => ({
  //       id: item.id,
  //       qtyToReturn: item.Qty,
  //     }));

  //     const resInvoiceArchive = await newRequest.post('/invoice/v1/archiveInvoice', {
  //       invoiceNo: searchInvoiceNumber,
  //       itemsToReturn,
  //     });

  //     // console.log("Archive Invoice Response:", resInvoiceArchive.data);
  //     toast.success(resInvoiceArchive?.data?.message || "Invoice archived successfully");
  //   } catch (err) {
  //     // console.error("Error archiving invoice:", err);
  //     toast.error(err?.response?.data?.error || err?.response?.data?.message || "Error In Archived The Data");
  //   }
  // };

  // DSALES no Invoice
  const handleSubmitDSalesInvoice = async () => {
    setLoading(true);

    try {
      const firstDataGridItem = dSalesNoInvoiceexchangeData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));

      const SecondDataGridItem = DSalesNoInvoiceData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));

      const selectTransactionCode = selectedTransactionCode?.TXN_CODE;
      const modifiedTransactionCode = selectTransactionCode.slice(0, -2) + "IN";

      // Body for the sales return (EXSR)
      const salesReturnBody = {
        _keyword_: "salesreturn",
        "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        data: [
          {
            Company: "SLIC",
            TransactionCode: `${selectTransactionCode}`,
            CustomerCode:
              selectedSalesReturnType === "DIRECT RETURN"
                ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                : selectedCustomerCode?.CUSTOMERCODE,
            SalesLocationCode: selectedLocation?.stockLocation,
            DeliveryLocationCode: selectedLocation?.stockLocation,
            UserId: "SYSADMIN",
            CustomerName: customerName,
            MobileNo: mobileNo,
            Remarks: remarks,
            PosRefNo: invoiceNumber,
            ZATCAPaymentMode: paymentModes.code,
            TaxExemptionReason: examptReason?.name || "",
            SalesmanCode: slicUserData?.SalesmanCode,
            Item: SecondDataGridItem,
          },
        ],
        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "SALESRETURN",
        LANG: "ENG",
      };

      console.log("Sales Return", salesReturnBody);

      if (isExchangeDSalesClick) {
        // Exchange scenario: Call both Sales Return and Invoice APIs
        const exsrRes = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          salesReturnBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Sales Return Response (EXSR):", exsrRes?.data);

        const exsrDocumentNo = exsrRes?.data?.message["Document No"];
        if (!exsrDocumentNo) {
          toast.error("Error in Sales Return API: Missing Document No");
          setLoading(false);
          return;
        }

        // Body for the invoice (EXIN)
        const salesInvoiceBody = {
          _keyword_: "Invoice",
          "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
          data: [
            {
              Company: "SLIC",
              TransactionCode: `${modifiedTransactionCode}`,
              CustomerCode:
                selectedSalesReturnType === "DIRECT RETURN"
                  ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                  : selectedCustomerCode?.CUSTOMERCODE,
              SalesLocationCode: selectedLocation?.stockLocation,
              DeliveryLocationCode: selectedLocation?.stockLocation,
              UserId: "SYSADMIN",
              CustomerName: customerName,
              MobileNo: mobileNo,
              Remarks: remarks,
              PosRefNo: invoiceNumber,
              ZATCAPaymentMode: paymentModes.code,
              TaxExemptionReason: examptReason?.name || "", // Invoice specific field
              SalesmanCode: slicUserData?.SalesmanCode,
              Item: firstDataGridItem,
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "INVOICE",
          LANG: "ENG",
        };

        console.log("Sales Invoice", salesInvoiceBody);

        // Call the Invoice API (EXIN)
        const exinRes = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          salesInvoiceBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Invoice Response (EXIN):", exinRes?.data);

        // Get document numbers for both EXSR and EXIN
        const exinDocumentNo = exinRes?.data?.message["Document No"];

        if (!exinDocumentNo) {
          toast.error("Error in Invoice API: Missing Document No");
          setLoading(false);
          return;
        }

        const documentNo = exinRes?.data?.message["Document No"];
        const headSysId = exinRes?.data?.message["Ref-No/SysID"];
        if (documentNo || headSysId) {
          handleDocumentNoUpdate(documentNo, headSysId, "DSALES NO INVOICE");
        }

        insertInvoiceRecord(documentNo);

        // Call Bank API for Exchange (EXSR + EXIN) Call Bank API for Exchange only if paymentModes.code === "4" or "5"
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const bankReceiptBody = {
            _keyword_: "BANKRCPTEX",
            "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
            data: [
              {
                Company: "SLIC",
                UserId: "SYSADMIN",
                Department: "011",
                TransactionCode: "BRV",
                Division: "100",
                BankApproverCode: bankApprovedCode,
                CashCardFlag: "CARD",
                ReceiptAmt:
                  totalAmountWithVat - totolAmountWithoutVatDSalesNoInvoice,
                CustomerId:
                  selectedSalesReturnType === "DIRECT RETURN"
                    ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                    : selectedCustomerCode?.CUSTOMERCODE,
                MatchingTransactions: [
                  {
                    DocNo: exinDocumentNo,
                    TransactionCode: modifiedTransactionCode,
                    PendingAmount: totalAmountWithVat,
                    AdjAmount: totalAmountWithVat,
                  },
                  {
                    DocNo: exsrDocumentNo,
                    TransactionCode: selectTransactionCode,
                    PendingAmount: totolAmountWithoutVatDSalesNoInvoice,
                    AdjAmount: totolAmountWithoutVatDSalesNoInvoice,
                  },
                ],
              },
            ],
            COMPANY: "SLIC",
            USERID: "SYSADMIN",
            APICODE: "BANKRECEIPTVOUCHER",
            LANG: "ENG",
          };

          console.log("Bank Api", bankReceiptBody);

          const bankApiResponse = await ErpTeamRequest.post(
            "/slicuat05api/v1/postData",
            bankReceiptBody,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Bank Receipt processed for Exchange");
          const bankDocumentNo =
            bankApiResponse?.data?.message?.["Document No"];

          // If bankDocumentNo is missing, show an error and stop
          if (!bankDocumentNo) {
            toast.error("Error in Bank API: Missing Document No");
            setLoading(false);
            return;
          }
        } else {
          console.log("No Bank API call for Exchange (Non-card/cash payment)");
        }

        showOtpPopup(exsrRes?.data);
        handleCloseCreatePopup();
        handleInvoiceGenerator();
        handleZatcaInvoiceGenerator();
        setLoading(false);
      } else {
        // Non-exchange scenario: Only call Sales Return API
        const res = await ErpTeamRequest.post(
          "/slicuat05api/v1/postData",
          salesReturnBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Sales Return Response:", res?.data);

        const documentNo = res?.data?.message["Document No"];
        const headSysId = res?.data?.message["Ref-No/SysID"];

        if (!documentNo || !headSysId) {
          toast.error(
            "Error in Sales Return API: Missing Document No or SysID"
          );
          setLoading(false);
          return;
        }
        if (documentNo || headSysId) {
          handleDocumentNoUpdate(documentNo, headSysId, "DSALES NO INVOICE");
        }

        insertInvoiceRecord(documentNo);

        // For Direct Sales Return Debit/Credit (paymentModes.code === 4 or 5)
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const documentNo = res?.data?.message["Document No"];
          const bankReceiptDI = {
            _keyword_: "BANKRCPTDI",
            "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
            data: [
              {
                Company: "SLIC",
                UserId: "SYSADMIN",
                Department: "011",
                TransactionCode: "BRV",
                Division: "100",
                BankApproverCode: bankApprovedCode,
                CashCardFlag: "CARD",
                ReceiptAmt: totolAmountWithoutVatDSalesNoInvoice,
                CustomerId:
                  selectedSalesReturnType === "DIRECT RETURN"
                    ? selectedCustomeNameWithDirectInvoice?.CUST_CODE
                    : selectedCustomerCode?.CUSTOMERCODE,
                MatchingTransactions: [
                  {
                    DocNo: documentNo,
                    TransactionCode: selectTransactionCode,
                    PendingAmount: totolAmountWithoutVatDSalesNoInvoice,
                    AdjAmount: totolAmountWithoutVatDSalesNoInvoice,
                  },
                ],
              },
            ],
            COMPANY: "SLIC",
            USERID: "SYSADMIN",
            APICODE: "BANKRECEIPTVOUCHER",
            LANG: "ENG",
          };

          const bankApiRes = await ErpTeamRequest.post(
            "/slicuat05api/v1/postData",
            bankReceiptDI,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log(
            "Bank Receipt processed for Direct Sales Return Debit/Credit"
          );
          const bankDocumentNo = bankApiRes?.data?.message?.["Document No"];

          // If bankDocumentNo is missing, show an error and stop
          if (!bankDocumentNo) {
            toast.error("Error in Bank API: Missing Document No");
            setLoading(false);
            return;
          }

        } else {
          console.log("Direct Sales Return - Cash (No Bank API Call)");
        }
        // Complete the process
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        // handleClearData();
        // handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!cashAmount) {
    //   toast.error(`Please type the ${paymentModes.name} Amount`);
    //   return;
    // }

    if (!selectedTransactionCode?.TXN_CODE) {
      toast.error(`Please select the Transaction Code`);
      return;
    }

    if (selectedSalesType === "DIRECT SALES INVOICE") {
      await handleSubmitDirectSalesInvoice();
      // insertInvoiceRecord();
    } else if (selectedSalesType === "DIRECT SALES RETURN") {
      await handleSubmitDirectSalesReturn();
      // insertInvoiceRecord();
    } else if (selectedSalesType === "DSALES NO INVOICE") {
      await handleSubmitDSalesInvoice();
      // insertInvoiceRecord();
    }
  };

  const validateForm = () => {
    if (
      (paymentModes.code === "4" || paymentModes.code === "5") &&
      bankApprovedCode.length < 4
    ) {
      setIsPrintEnabled(false);
    } else {
      setIsPrintEnabled(true);
    }
  };

  useEffect(() => {
    validateForm();
  }, [bankApprovedCode, paymentModes]);

  // useEffect(() => {
  //   if(PaymentModels) {
  //     console.log(paymentModes);
  //   }
  // }, [PaymentModels]);

  // useEffect(() => {
  //   if(ExamptionReason) {
  //     console.log(examptReason);
  //   }
  // }, [ExamptionReason]);

  // useEffect(() => {
  //   if (invoiceHeaderData) {
  //     console.log(invoiceHeaderData)
  //   }
  // }, [invoiceHeaderData]);

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="popup-container bg-white rounded-lg shadow-lg h-auto sm:w-[50%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    F3 Tender Cash - {selectedSalesType}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 14H4"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4h16v16H4z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-white hover:text-red-600 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-0 w-full">
                <div className="grid grid-cols-2 gap-4">
                  {/* Invoice Form */}
                  <form onSubmit={handleSubmit} className="border p-4 w-full">
                    <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 overflow-x-auto">
                      <div className="min-w-[300px] min-h-[100px]">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-2 bg-gray-200 p-2 rounded-t-lg">
                          <p className="text-sm">Item Code</p>
                          <p className="text-sm">Size</p>
                          <p className="text-sm">Item Price</p>
                        </div>

                        {selectedSalesType === "DIRECT SALES RETURN"
                          ? storeInvoiceDatagridData?.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-2 border-t border-gray-300 p-2"
                              >
                                <p className="text-sm">{item.SKU}</p>
                                <p className="text-sm">{item.ItemSize}</p>
                                <p className="text-sm">{item.ItemPrice}</p>
                              </div>
                            ))
                          : selectedSalesType === "DSALES NO INVOICE"
                          ? DSalesNoInvoiceData?.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-2 border-t border-gray-300 p-2"
                              >
                                <p className="text-sm">{item.SKU}</p>
                                <p className="text-sm">{item.ItemSize}</p>
                                <p className="text-sm">{item.ItemPrice}</p>
                              </div>
                            ))
                          : storeDatagridData?.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-2 border-t border-gray-300 p-2"
                              >
                                <p className="text-sm">{item.SKU}</p>
                                <p className="text-sm">{item.ItemSize}</p>
                                <p className="text-sm">{item.ItemPrice}</p>
                              </div>
                            ))}
                      </div>
                    </div>

                    {/* Gross Amount Display */}
                    <div className="mt-4">
                      <p className="text-sm font-sans text-red-500">
                        Gross Amount with 15% VAT: SAR {grossAmount}
                      </p>
                    </div>
                    <div className="mt-10">
                      {/* <Button
                        variant="contained"
                        style={{
                          backgroundColor: "#021F69", // Change color based on enabled/disabled state
                          //   backgroundColor: isPrintEnabled ? "#021F69" : "#d3d3d3", // Change color based on enabled/disabled state
                          //   // color: isPrintEnabled ? "#ffffff" : "#a9a9a9",
                        }}
                        type="submit"
                        // disabled={!isPrintEnabled || loading}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : null
                        }
                      >
                        Print
                      </Button> */}
                      <Button
                        variant="contained"
                        style={{
                          backgroundColor: isPrintEnabled
                            ? "#021F69"
                            : "#d3d3d3",
                          color: isPrintEnabled ? "#ffffff" : "#a9a9a9",
                        }}
                        type="submit"
                        disabled={!isPrintEnabled || loading}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : null
                        }
                      >
                        Print
                      </Button>
                    </div>
                  </form>

                  <div className="border p-2 w-full">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="mt-3">
                        {/* <p className="font-semibold text-sm">
                          {paymentModes.name || "Payment Mode"}
                        </p> */}
                        {/* For Direct Sales Invoice */}
                        {selectedSalesType === "DIRECT SALES INVOICE" && (
                          <>
                            {paymentModes.code === "4" ||
                            paymentModes.code === "5" ? (
                              <>
                                <div className="mb-3">
                                  <p className="font-semibold">Cash</p>
                                  <input
                                    type="text"
                                    value={totalAmountWithVat}
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder={
                                      paymentModes.name || "Payment Mode"
                                    }
                                    readOnly
                                  />
                                </div>
                                {/* Total Amount in the middle */}
                                <div className="mb-3">
                                  <p className="font-semibold">Total Amount</p>
                                  <input
                                    type="text"
                                    value={totalAmountWithVat}
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Total Amount"
                                  />
                                </div>
                                {/* Change for credit/debit is always 0 */}
                                <div className="mb-3">
                                  <p className="font-semibold">Change</p>
                                  <input
                                    type="text"
                                    value={0}
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Change"
                                  />
                                </div>
                                <div className="mb-3">
                                  <p className="font-semibold">
                                    Bank Approval Code
                                  </p>
                                  <input
                                    type="text"
                                    value={bankApprovedCode}
                                    onChange={(e) =>
                                      setBankApprovedCode(e.target.value)
                                    }
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder="Enter Bank Approval Code"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Cash Payment */}
                                <div className="mb-3">
                                  <p className="font-semibold">Cash</p>
                                  <input
                                    type="text"
                                    value={cashAmount}
                                    onChange={(e) =>
                                      setCashAmount(e.target.value)
                                    }
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder={
                                      paymentModes.name || "Payment Mode"
                                    }
                                  />
                                </div>
                                <div className="mb-3">
                                  <p className="font-semibold">Total Amount</p>
                                  <input
                                    type="text"
                                    value={totalAmountWithVat}
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Total Amount"
                                  />
                                </div>
                                {/* Change for cash payment */}
                                <div className="mb-3">
                                  <p className="font-semibold">Change</p>
                                  <input
                                    type="text"
                                    value={
                                      Number(cashAmount) -
                                      Number(totalAmountWithVat)
                                    }
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Change"
                                  />
                                </div>
                                {/* {(paymentModes.code === "4" || paymentModes.code === "5") && (
                                 
                                )} */}
                              </>
                            )}
                          </>
                        )}

                        {selectedSalesType === "DIRECT SALES RETURN" && (
                          <>
                            {/* {(paymentModes.code === "4" || paymentModes.code === "5") ? (
                              <>
                              <div className="mb-3">
                                <p className="font-semibold">Exchange Amount</p>
                                <input
                                  type="text"
                                  value={grossAmount}
                                  readOnly
                                  className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                  placeholder="Total Amount"
                                />
                              </div>
                              </>
                            ) : (
                              <>
                                <div className="mb-3">
                                 <p className="font-semibold">Total Amount</p>
                                  <input
                                    type="text"
                                    value={totolAmountWithoutExchange}
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder={paymentModes.name || "Payment Mode"}
                                    readOnly
                                  />
                                </div>
                              </>
                            )} */}
                            {!isExchangeClick && (
                              <div className="mb-3">
                                <p className="font-semibold">Return Amount</p>
                                <input
                                  type="text"
                                  value={totolAmountWithoutExchange}
                                  className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                  placeholder={
                                    paymentModes.name || "Payment Mode"
                                  }
                                  readOnly
                                />
                              </div>
                            )}

                            {isExchangeClick && (
                              <>
                                <div className="mb-3">
                                  <p className="font-semibold">
                                    Exchange Amount
                                  </p>
                                  <input
                                    type="text"
                                    value={grossAmount}
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Total Amount"
                                  />
                                </div>
                                <div className="mb-3">
                                  <p className="font-semibold">Return Amount</p>
                                  <input
                                    type="text"
                                    value={totolAmountWithoutExchange}
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder={
                                      paymentModes.name || "Payment Mode"
                                    }
                                    readOnly
                                  />
                                </div>
                                <div className="mb-3">
                                  <p className="font-semibold">Difference</p>
                                  <input
                                    type="text"
                                    value={
                                      grossAmount - totolAmountWithoutExchange
                                    }
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Difference"
                                  />
                                </div>
                              </>
                            )}
                            {/* Bank Approval Code (shown at the end for paymentModes code 4 or 5) */}
                            {(paymentModes.code === "4" ||
                              paymentModes.code === "5") && (
                              <div className="mb-3">
                                <p className="font-semibold">
                                  Bank Approval Code
                                </p>
                                <input
                                  type="text"
                                  value={bankApprovedCode}
                                  onChange={(e) =>
                                    setBankApprovedCode(e.target.value)
                                  }
                                  className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                  placeholder="Enter Bank Approval Code"
                                />
                              </div>
                            )}
                          </>
                        )}

                        {selectedSalesType === "DSALES NO INVOICE" && (
                          <>
                            {/* {(paymentModes.code === "4" || paymentModes.code === "5") ? (
                              <>
                                <div className="mb-3">
                                 <p className="font-semibold">Total Amount</p>
                                  <input
                                    type="text"
                                    value={totolAmountWithoutVatDSalesNoInvoice}
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder={paymentModes.name || "Payment Mode"}
                                    readOnly
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="mb-3">
                                  <p className="font-semibold">Return Amount</p>
                                  <input
                                    type="text"
                                    value={totolAmountWithoutVatDSalesNoInvoice}
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Total Amount"
                                  />
                                </div>
                              </>
                            )} */}

                            {!isExchangeDSalesClick && (
                              <div className="mb-3">
                                <p className="font-semibold">Return Amount</p>
                                <input
                                  type="text"
                                  value={totolAmountWithoutVatDSalesNoInvoice}
                                  className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                  placeholder={
                                    paymentModes.name || "Payment Mode"
                                  }
                                  readOnly
                                />
                              </div>
                            )}

                            {isExchangeDSalesClick && (
                              <>
                                <div className="mb-3">
                                  <p className="font-semibold">
                                    Exchange Amount
                                  </p>
                                  <input
                                    type="text"
                                    value={grossAmount}
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Total Amount"
                                  />
                                </div>
                                <div className="mb-3">
                                  <p className="font-semibold">Return Amount</p>
                                  <input
                                    type="text"
                                    value={totolAmountWithoutVatDSalesNoInvoice}
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                    placeholder={
                                      paymentModes.name || "Payment Mode"
                                    }
                                    readOnly
                                  />
                                </div>
                                <div className="mb-3">
                                  <p className="font-semibold">Difference</p>
                                  <input
                                    type="text"
                                    value={
                                      grossAmount -
                                      totolAmountWithoutVatDSalesNoInvoice
                                    }
                                    readOnly
                                    className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                                    placeholder="Difference"
                                  />
                                </div>
                              </>
                            )}
                            {/* Bank Approval Code (shown at the end for paymentModes code 4 or 5) */}
                            {(paymentModes.code === "4" ||
                              paymentModes.code === "5") && (
                              <div className="mb-3">
                                <p className="font-semibold">
                                  Bank Approval Code
                                </p>
                                <input
                                  type="text"
                                  value={bankApprovedCode}
                                  onChange={(e) =>
                                    setBankApprovedCode(e.target.value)
                                  }
                                  className="w-full border border-gray-300 px-2 py-2 rounded-md"
                                  placeholder="Enter Bank Approval Code"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default F3TenderCashPopUp;
