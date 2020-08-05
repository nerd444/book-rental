const express = require("express");
const auth = require("../middleware/auth");
const {
  getBooks,
  book_rental,
  myRentalList,
  book_return,
} = require("../controllers/book_rental");

const router = express.Router();

// api/v1/rentals
router.route("/").get(getBooks).post(auth, book_rental);
router.route("/rentalList").get(auth, myRentalList);
router.route("/:rental_id").delete(book_return);

module.exports = router;
