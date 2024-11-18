const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { API_URLS, STATUS_CODES, PORTS } = require("./constants");
const PORT = PORTS.SERVER || 5000;

let bookCollection = [];
let borrowedBooks = [];

const assignUniqueID = (book) => {
  if (!book.bookID) {
    book.bookID = uuidv4();
  }
  return book;
};

const loadBookData = () => {
  try {
    bookCollection = JSON.parse(
      fs.readFileSync("./bookcollection.json", "utf8")
    );
    bookCollection.forEach((book) => {
      assignUniqueID(book);
    });
  } catch (err) {
    console.log("No existing book collection found.");
  }
  try {
    borrowedBooks = JSON.parse(fs.readFileSync("./borrowedBooks.json", "utf8"));
  } catch (err) {
    console.log("No existing borrowed books found.");
  }
};

app.use(loadBookData);
app.use(express.json());

app.get(API_URLS.SHOW_BOOK, (req, res) => {
  if (bookCollection.length === 0) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "No books available." });
  }
  res.status(STATUS_CODES.SUCCESS).json(bookCollection);
});

app.post(API_URLS.ADD_BOOK, (req, res) => {
  const { bookName, bookAuthor, bookDOP, bookEdition } = req.body;

  if (!bookName || !bookAuthor || !bookDOP || !bookEdition) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "Missing required fields." });
  }

  const newBook = { bookName, bookAuthor, bookDOP, bookEdition };
  assignUniqueID(newBook);

  bookCollection.push(newBook);

  fs.writeFile(
    "./bookcollection.json",
    JSON.stringify(bookCollection, null, 2),
    (err) => {
      if (err) {
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ message: "Error adding the book to the collection." });
      }
      res
        .status(STATUS_CODES.CREATED)
        .json({ message: "Book added successfully.", book: newBook });
    }
  );
});

app.post(API_URLS.BORROW_BOOK, (req, res) => {
  const { bookID } = req.body;

  if (!bookID) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "Missing bookID." });
  }

  const bookToBorrow = bookCollection.find((book) => book.bookID === bookID);

  if (!bookToBorrow) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "Book not found." });
  }

  borrowedBooks.push(bookToBorrow);
  bookCollection = bookCollection.filter((book) => book.bookID !== bookID);

  fs.writeFile(
    "./bookcollection.json",
    JSON.stringify(bookCollection, null, 2),
    (err) => {
      if (err) {
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ message: "Error saving the book collection." });
      }
    }
  );

  fs.writeFile(
    "./borrowedBooks.json",
    JSON.stringify(borrowedBooks, null, 2),
    (err) => {
      if (err) {
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ message: "Error saving the borrowed books." });
      }
      res
        .status(STATUS_CODES.CREATED)
        .json({ message: "Book borrowed successfully.", book: bookToBorrow });
    }
  );
});

app.patch(API_URLS.UPDATE_BOOK, (req, res) => {
  const { bookName, bookAuthor, bookDOP, bookEdition, bookID } = req.body;

  if (!bookName || !bookAuthor || !bookDOP || !bookEdition || bookID) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "Missing required fields." });
  }

  const bookToUpdate = bookCollection.find((book) => book.bookID === bookID);

  if (!bookToUpdate) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "Book not found." });
  }

  bookToUpdate.bookName = bookName;
  bookToUpdate.bookAuthor = bookAuthor;
  bookToUpdate.bookDOP = bookDOP;
  bookToUpdate.bookEdition = bookEdition;

  fs.writeFile(
    "./bookcollection.json",
    JSON.stringify(bookCollection, null, 2),
    (err) => {
      if (err) {
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ message: "Error updating the book collection." });
      }
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Book updated successfully.", book: bookToUpdate });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
