const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Transaction = require("./transactionModel");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/money_tracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const totalAmount = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    res.render("index.ejs", { transactions, totalAmount });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).send("Error fetching transactions");
  }
});

app.post("/transactions", async (req, res) => {
  try {
    const { description, amount } = req.body;
    if (!description || !amount) {
      return res
        .status(400)
        .json({ error: "Description and amount are required" });
    }
    const transaction = new Transaction({ description, amount });
    await transaction.save();
    const transactions = await Transaction.find();
    const totalAmount = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    res
      .status(201)
      .json({
        message: "Transaction added successfully",
        transaction,
        totalAmount,
      });
  } catch (err) {
    console.error("Error saving transaction to database:", err);
    res.status(500).json({ error: "Error saving transaction to database" });
  }
});

app.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    const transactions = await Transaction.find();
    const totalAmount = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    res.json({ message: "Transaction deleted successfully", totalAmount });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Error deleting transaction" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
