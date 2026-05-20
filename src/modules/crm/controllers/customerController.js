const Customer = require("../models/Customer");

// Added tenantId filtering across all queries
// to enforce multi-tenancy — each tenant can only access their own data.

/**
 * CREATE CUSTOMER
 */
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status, assignedTo } = req.body;

    // Duplicacy checking
    if (email) {
      const existing = await Customer.findOne({ email });
      if (existing) {
        return res.status(400).json({
          message: "Customer with this email already exists",
        });
      }
    }

    const customer = await Customer.create({
      tenantId: req.user.tenantId,
      name,
      email,
      phone,
      company,
      status,
      assignedTo,
      createdBy: req.user.id, // JWT middleware se aayega
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating customer",
      error: error.message,
    });
  }
};

/**
 * GET ALL CUSTOMERS
 */
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ tenantId: req.user.tenantId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customers",
      error: error.message,
    });
  }
};

/**
 * GET SINGLE CUSTOMER
 */
const getSingleCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer",
      error: error.message,
    });
  }
};

/**
 * UPDATE CUSTOMER
 */
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating customer",
      error: error.message,
    });
  }
};

/**
 * DELETE CUSTOMER
 */
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting customer",
      error: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};
