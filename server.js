const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

let bookCollection = JSON.parse(
  fs.readFileSync("./bookCollection.json", "utf8")
);

let borrowedBooks = JSON.parse(fs.readFileSync("./borrowedBooks.json", "utf8"));

const assignUniqueID = (book) => {
  if (!book.bookID) {
    book.bookID = uuidv4();
  }
  return book;
};

bookCollection.forEach((book) => assignUniqueID(book));

const express = require("express");
const app = express();

const { API_URLS, STATUS_CODES, PORTS } = require("./constants");
const PORT = PORTS.SERVER || 5000;

app.use(express.json());

// GET all books
app.get(API_URLS.SHOW_BOOK, (req, res) => {
  if (bookCollection.length === 0) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "No books available." });
  }
  res.status(STATUS_CODES.SUCCESS).json(bookCollection);
});

// POST add a new book
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

  const writeBookCollection = fs.promises.writeFile(
    "./bookCollection.json",
    JSON.stringify(bookCollection, null, 2)
  );

  writeBookCollection
    .then(() => {
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Book added successfully.", book: newBook });
    })
    .catch((err) => {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: "Error adding the book to the collection.",
        error: err.message,
      });
    });
});

// POST borrow a book
app.post(API_URLS.BORROW_BOOK, (req, res) => {
  const { bookID } = req.body;

  if (bookCollection.length === 0) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "No books available to borrow." });
  } else if (!bookID) {
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

  const isAlreadyBorrowed = borrowedBooks.some(
    (book) => book.bookID === bookID
  );
  if (isAlreadyBorrowed) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "This book has already been borrowed." });
  }

  borrowedBooks.push(bookToBorrow);
  bookCollection = bookCollection.filter((book) => book.bookID !== bookID);

  const writeBookCollection = fs.promises.writeFile(
    "./bookCollection.json",
    JSON.stringify(bookCollection, null, 2)
  );

  const writeBorrowedBooks = fs.promises.writeFile(
    "./borrowedBooks.json",
    JSON.stringify(borrowedBooks, null, 2)
  );

  Promise.all([writeBookCollection, writeBorrowedBooks])
    .then(() => {
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Book borrowed successfully.", book: bookToBorrow });
    })
    .catch((err) => {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: "Error saving the updated collections.",
        error: err.message,
      });
    });
});

// POST return a book
app.post(API_URLS.RETURN_BOOK, (req, res) => {
  const { bookID } = req.body;

  if (!bookID) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "Missing bookID." });
  }

  const bookToReturn = borrowedBooks.find((book) => book.bookID === bookID);

  if (!bookToReturn) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "Book not found." });
  }

  const isAlreadyInCollection = bookCollection.some(
    (book) => book.bookID === bookID
  );
  if (isAlreadyInCollection) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "This book is already returned." });
  }

  bookCollection.push(bookToReturn);
  borrowedBooks = borrowedBooks.filter((book) => book.bookID !== bookID);

  const writeBookCollection = fs.promises.writeFile(
    "./bookCollection.json",
    JSON.stringify(bookCollection, null, 2)
  );

  const writeBorrowedBooks = fs.promises.writeFile(
    "./borrowedBooks.json",
    JSON.stringify(borrowedBooks, null, 2)
  );

  Promise.all([writeBookCollection, writeBorrowedBooks])
    .then(() => {
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Book returned successfully.", book: bookToReturn });
    })
    .catch((err) => {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: "Error saving the updated collections.",
        error: err.message,
      });
    });
});

// PATCH update a book
app.patch(API_URLS.UPDATE_BOOK, (req, res) => {
  const { bookName, bookAuthor, bookDOP, bookEdition, bookID } = req.body;

  if (!bookName || !bookAuthor || !bookDOP || !bookEdition || !bookID) {
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

  const writeBookCollection = fs.promises.writeFile(
    "./bookCollection.json",
    JSON.stringify(bookCollection, null, 2)
  );

  writeBookCollection
    .then(() => {
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Book updated successfully.", book: bookToUpdate });
    })
    .catch((err) => {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: "Error updating the book collection.",
        error: err.message,
      });
    });
});

// DELETE a book
app.delete(API_URLS.DELETE_BOOK, (req, res) => {
  const { bookID } = req.body;

  if (!bookID) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "Missing bookID." });
  }

  const bookToDelete = bookCollection.find((book) => book.bookID === bookID);

  if (!bookToDelete) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "Book not found." });
  }

  bookCollection = bookCollection.filter((book) => book.bookID !== bookID);

  const writeBookCollection = fs.promises.writeFile(
    "./bookCollection.json",
    JSON.stringify(bookCollection, null, 2)
  );

  writeBookCollection
    .then(() => {
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Book deleted successfully.", book: bookToDelete });
    })
    .catch((err) => {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting the book.",
        error: err.message,
      });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
