import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import booksData from "./data/books.json";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/books";
const connectToMongo = () => {
  mongoose
    .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected successfully"))
    .catch((err) => {
      console.error("Connection error:", err);
      setTimeout(connectToMongo, 5000);
    });
};

connectToMongo();
mongoose.Promise = Promise;

//Creates a mongoose model named "Books"
const Books = mongoose.model("Books", {
  bookID: Number,
  title: String,
  authors: String,
  average_rating: Number,
  isbn: Number,
  isbn13: Number,
  language_code: String,
  num_pages: Number,
  ratings_count: Number,
  text_review_count: Number,
});

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();
const listEndpoints = require("express-list-endpoints");

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

// Route to get all books
app.get("/books", (req, res) => {
  try {
    res.json(booksData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define the Author schema
const authorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
});

// Create the Author model
const Author = mongoose.model("Author", authorSchema);

// Route to get all authors
app.get("/authors", async (req, res) => {
  try {
    // Fetch all authors from the database
    const authors = await Author.find();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to get authors by last name
app.get("/authors/:lastName", (req, res) => {
  const requestedLastName = req.params.lastName;
  // Find all authors with the requested last name
  const matchingAuthors = authors.filter(
    (a) => a.lastName === requestedLastName
  );

  if (matchingAuthors.length > 0) {
    res.json(matchingAuthors);
  } else {
    res
      .status(404)
      .json({ error: "Authors not found with the specified last name" });
  }
});

// Route to get a single book by ID
app.get("/books/:bookID", (req, res) => {
  try {
    const { bookID } = req.params;

    // Find the book in booksData based on the bookID
    const specificBook = booksData.find(
      (book) => book.bookID === parseInt(bookID)
    );

    if (specificBook) {
      res.json(specificBook);
    } else {
      res.status(404).json({ error: "Book not found, try another number" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
