const mod10CheckDigit = require("mod10-check-digit");
const { validationResult } = require("express-validator");

const ItemCodeModel = require("../models/tblItemCodes1S1Br");
const BarSeriesNo = require("../models/barSeriesNo");
const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");

async function generateBarcode(id) {
  const GCP = "6287898";
  const seriesNo = await BarSeriesNo.getBarSeriesNo(id);
  if (!seriesNo) {
    const error = new CustomError("BarSeriesNo not found");
    error.statusCode = 404;
    throw error;
  }

  const CHECK_DIGIT = mod10CheckDigit(`${GCP}${seriesNo.BarSeriesNo}`);
  const barcode = `${GCP}${seriesNo.BarSeriesNo}${CHECK_DIGIT}`;

  if (barcode.length != 13) {
    const error = new CustomError(
      "Generated barcode is not 13 characters long"
    );
    error.statusCode = 500;
    throw error;
  }

  const number = (Number(seriesNo.BarSeriesNo) + 1).toString();

  const result = await BarSeriesNo.updateBarSeriesNo(id, number);
  if (!result) {
    const error = new CustomError("Failed to update BarSeriesNo");
    error.statusCode = 500;
    throw error;
  }

  return barcode;
}

exports.getItemCodes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || null;

    const result = await ItemCodeModel.findAllWithPagination(
      page,
      limit,
      search
    );
    const { itemCodes, pagination } = result;

    if (!itemCodes || itemCodes.length <= 0) {
      const error = new Error("No item codes found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(
      generateResponse(200, true, "Item codes retrieved successfully", {
        itemCodes,
        pagination,
      })
    );
  } catch (error) {
    error.message = null;
    next(error);
  }
};

exports.getAllItemCodes = async (req, res, next) => {
  try {
    const result = await ItemCodeModel.findAll();

    if (!result || result.length <= 0) {
      const error = new Error("No item codes found");
      error.statusCode = 404;
      return next(error);
    }

    res
      .status(200)
      .json(
        generateResponse(200, true, "Item codes retrieved successfully", result)
      );
  } catch (error) {
    console.log(error);
    error.message = null;
    next(error);
  }
};

exports.postItemCode = async (req, res, next) => {
  try {
    const { itemCode, quantity, description, startSize, endSize } = req.body;

    const barcode = await generateBarcode(1);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // // Convert date fields to ISO-8601 strings
    // if (body.ExpiryDate) {
    //   body.ExpiryDate = new Date(body.ExpiryDate).toISOString();
    // }
    // if (body.ProductionDate) {
    //   body.ProductionDate = new Date(body.ProductionDate).toISOString();
    // }

    // const _itemCode = await ItemCodeModel.create(req.body);

    const body = {
      GTIN: barcode,
      ItemCode: itemCode,
      ItemQty: Number(quantity),
      EnglishName: description,
      ArabicName: description,
      QRCodeInternational: barcode,
      ProductSize: startSize,
    };
    const _itemCode = await ItemCodeModel.create(body);

    res
      .status(201)
      .json(
        generateResponse(201, true, "Item code created successfully", _itemCode)
      );
  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.putItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;
    const body = req.body;

    const existingItemCode = await ItemCodeModel.findById(GTIN);

    if (!existingItemCode) {
      return res
        .status(404)
        .json(generateResponse(404, false, "Item code not found"));
    }

    if (body.ExpiryDate) {
      body.ExpiryDate = new Date(body.ExpiryDate).toISOString();
    }
    if (body.ProductionDate) {
      body.ProductionDate = new Date(body.ProductionDate).toISOString();
    }

    const updatedData = {
      ...existingItemCode,
      ...body,
    };

    const updatedItemCode = await ItemCodeModel.update(GTIN, updatedData);

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code updated successfully",
          updatedItemCode
        )
      );
  } catch (error) {
    console.log(error);
    error.message = null;
    next(error);
  }
};

exports.deleteItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;
    const itemCode = await ItemCodeModel.findById(GTIN);
    if (!itemCode) {
      const error = new Error("Item code not found");
      error.statusCode = 404;
      return next(error);
    }
    const deletedItemCode = await ItemCodeModel.delete(GTIN);
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code deleted successfully",
          deletedItemCode
        )
      );
  } catch (error) {
    console.log(error);
    error.message = null;
    next(error);
  }
};
