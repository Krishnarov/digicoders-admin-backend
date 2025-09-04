import ExpressMongoSanitize from "express-mongo-sanitize";
import Hr from "../models/manageHr.js";

export const createHr = async (req, res) => {
  try {
    const hr = await Hr.create(req.body);
    if (!hr)
      return res
        .status(404)
        .json({ message: "Hr creating failde", success: false });
    return res
      .status(201)
      .json({ message: "Hr created successfulll !", success: true });
  } catch (error) {
    res.status(500).json({ message: "internal servcer error", success: false });
  }
};

export const getAllHr = async (req, res) => {
  try {
    const hr = await Hr.find();
    return res
      .status(200)
      .json({ message: "successfull", data: hr, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error, success: false });
  }
};

export const updataHr = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const hr = await Hr.findById(req.params.id);
    if (!hr)
      return res.status(404).json({ message: "hr not found", success: false });
    if (typeof isActive !== "undefined") hr.isActive = isActive;
    if (name) hr.name = name;
    await hr.save();
    return res
      .status(200)
      .json({ message: "Hr updated successfull",  success: true });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      success: false,
      error,
      success: false,
    });
  }
};

export const deletaHr = async (req, res) => {
  try {
    const hr = await Hr.findByIdAndDelete(req.params.id);
    if (!hr)
      return res
        .status(404)
        .json({ message: "Hr deleting faild!", success: false });
    return res
      .status(200)
      .json({ message: "Hr deleted successfull ", success: true });
  } catch (error) {
    res.status(500).json({ message: "internal server error", success: false });
  }
};
