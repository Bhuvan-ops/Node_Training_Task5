// Server.js

const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { STATUS_CODES, API_URLS, PORTS } = require("./constants");
const { error } = require("console");

const PORT = PORTS.SERVER || 5000;

app.use(express.json());

const assignUniqueIds = (books) => {
  return books.map((book) => {
    if (!book.id) {
      book.id = uuidv4();
    }
    return book;
  });
};

app.get(API_URLS.GET_BOOKS, (req, res) => {
  fs.readFile("bookcollection.json", "utf8", (err, data) => {
    if (err) {
      return res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ msg: "Error reading file", error: err });
    }
    try {
      let bookCollection = JSON.parse(data);
      bookCollection = assignUniqueIds(bookCollection);
      return res.json(bookCollection);
    } catch (err) {
      return res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ msg: "Error parsing JSON data", error: err });
    }
  });
});

app.post(API_URLS.ADD_BOOK, (req, res) => {
  const bookData = req.body;
  bookData.id = uuidv4();

  fs.readFile("bookcollection.json", "utf8", (err, data) => {
    let bookCollection = [];

    if (!err) {
      try {
        bookCollection = JSON.parse(data);
      } catch (err) {
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ msg: "Error parsing JSON data", error: err });
      }
    }

    bookCollection.push(bookData);

    fs.writeFile(
      "bookcollection.json",
      JSON.stringify(bookCollection),
      (err) => {
        if (err) {
          return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ msg: "Error saving book data", error: err });
        }
        res
          .status(STATUS_CODES.CREATED)
          .json({ msg: "Book added successfully", bookId: bookData.id });
      }
    );
  });
});

app.patch(API_URLS.UPDATE_BOOK, (req, res) => {
  const { id, bookName, bookDOP, bookEdition } = req.body;

  fs.readFile("bookcollection.json", "utf8", (err, data) => {
    let bookCollection = [];

    if (err) {
      return res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: "Error reading file", details: err });
    }

    try {
      bookCollection = JSON.parse(data);
    } catch (jsonError) {
      return res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: "Error parsing JSON data", details: jsonError });
    }

    const bookIndex = bookCollection.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: "Book not found", details: { id } });
    }

    if (bookName) bookCollection[bookIndex].bookName = bookName;
    if (bookDOP) bookCollection[bookIndex].bookDOP = bookDOP;
    if (bookEdition) bookCollection[bookIndex].bookEdition = bookEdition;

    fs.writeFile(
      "bookcollection.json",
      JSON.stringify(bookCollection),
      (err) => {
        if (err) {
          return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ error: "Error saving book data", details: err });
        }
        res
          .status(STATUS_CODES.SUCCESS)
          .json({ message: "Book updated successfully", bookId: id });
      }
    );
  });
});

app.delete(API_URLS.DELETE_BOOK, (req, res) => {
  const { id } = req.body;

  fs.readFile("bookcollection.json", "utf8", (err, data) => {
    let bookCollection = [];

    if (err) {
      return res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: "Error reading file", details: err });
    }

    try {
      bookCollection = JSON.parse(data);
    } catch (jsonError) {
      return res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: "Error parsing JSON data", details: jsonError });
    }

    const bookIndex = bookCollection.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: "Book not found", details: { id } });
    }

    bookCollection.splice(bookIndex, 1);

    fs.writeFile(
      "bookcollection.json",
      JSON.stringify(bookCollection),
      (err) => {
        if (err) {
          return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ error: "Error deleting book data", details: err });
        }
        res
          .status(STATUS_CODES.SUCCESS)
          .json({ message: "Book deleted successfully", bookId: id });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
