// constants.js

module.exports = {
  API_URLS: {
    ADD_BOOK: "/homepage/addbook",
    BORROW_BOOK: "/homepage/borrowbook",
    UPDATE_BOOK: "/homepage/updatebook",
    DELETE_BOOK: "/homepage/deletebook",
    SHOW_BOOK: "/homepage/showbook",
    RETURN_BOOK: "/homepage/returnbook",
    BASE_URL: "http://localhost:5000",
  },

  STATUS_CODES: {
    SUCCESS: 200,
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
  },

  PORTS: {
    SERVER: 5000,
  },
};
