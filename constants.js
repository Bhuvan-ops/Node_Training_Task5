// constants.js

const PORTS = {
  SERVER: 5000,
  UIUX: 3000,
};

const STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const API_URLS = {
  GET_BOOKS: "/api/books/get",
  ADD_BOOK: "/api/books/add",
  UPDATE_BOOK: "/api/books/update",
  DELETE_BOOK: "/api/books/delete",
};

module.exports = { STATUS_CODES, API_URLS, PORTS };
