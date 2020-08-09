const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create schema
const transactionSchema = new Schema(
 
  // Input key value pairs
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
