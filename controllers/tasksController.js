const Task = require("../models/Task");
const User = require("../models/User");
const Customer = require("../models/Customer");

// GET ALL TASKS
const getAllTasks = async (req, res) => {
  // Get all tasks from MongoDB
  const tasks = await Task.find().lean();

  // If no tasks
  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  // Add username and customer to each task before sending the response
  const tasksWithUserAndCustomer = await Promise.all(
    tasks.map(async (task) => {
      const user = await User.findById(task.user).lean().exec();
      const customer = await Customer.findById(task.customer).lean().exec();
      return { ...task, username: user.username, customer: customer._id, customerName: customer.name };
    })
  );

  res.json(tasksWithUserAndCustomer);
};

// CREATE A NEW TASK
const createNewTask = async (req, res) => {
  const { user, customer, title, text } = req.body;

  // Confirm data
  if (!user || !customer || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Task.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate task title" });
  }

  // Create and store the new task
  const task = await Task.create({ user, customer, title, text });

  if (task) {
    // Created
    return res.status(201).json({ message: "New task created" });
  } else {
    return res.status(400).json({ message: "Invalid task data received" });
  }
};

// UPDATE A TASK
const updateTask = async (req, res) => {
  const { id, user, customer, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !customer || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm task exists to update
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  // Check for duplicate title
  const duplicate = await Task.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original task
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate task title" });
  }

  task.user = user;
  task.customer = customer;
  task.title = title;
  task.text = text;
  task.completed = completed;

  const updatedTask = await task.save();

  res.json(`'${updatedTask.title}' updated`);
};

// DELETE A TASK
const deleteTask = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Task ID required" });
  }

  // Confirm task exists to delete
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  const result = await task.deleteOne();

  const reply = `Task '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = { getAllTasks, createNewTask, updateTask, deleteTask };