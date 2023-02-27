const Customer = require("../models/Customer");

// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
  // Get all customers from MongoDB
  const customers = await Customer.find().lean();

  // If no customers
  if (!customers?.length) {
    return res.status(400).json({ message: "No customers found" });
  }

  res.json(customers);
};

// CREATE A NEW CUSTOMER
const createNewCustomer = async (req, res) => {
  const { name, company, phone, email } = req.body;

  // Confirm data
  if (!name || !company || !phone || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const customerObject = { name, company, phone, email };

  // Create and store new customer
  const customer = await Customer.create(customerObject);

  if (customer) {
    //created
    res.status(201).json({ message: `New customer ${name} created` });
  } else {
    res.status(400).json({ message: "Invalid customer data received" });
  }
};

// UPDATE A CUSTOMER
const updateCustomer = async (req, res) => {
  const { id, name, company, phone, email } = req.body;

  // Confirm data
  if (
    !id ||
    !name ||
    !company ||
    !phone ||
    !email
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required" });
  }

  // Does the customer exist to update?
  const customer = await Customer.findById(id).exec();

  if (!customer) {
    return res.status(400).json({ message: "Customer not found" });
  }

  customer.name = name;
  customer.company = company;
  customer.phone = phone;
  customer.email = email;

  const updatedCustomer = await customer.save();

  res.json({ message: `${updatedCustomer.name} updated` });
};

// DELETE A CUSTOMER
const deleteCustomer = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Customer ID Required" });
  }

  // Does the customer exist to delete?
  const customer = await Customer.findById(id).exec();

  if (!customer) {
    return res.status(400).json({ message: "Customer not found" });
  }

  const result = await customer.deleteOne();

  const reply = `Customer : ${result.name} deleted`;

  res.json(reply);
};

module.exports = { getAllCustomers, createNewCustomer, updateCustomer, deleteCustomer };