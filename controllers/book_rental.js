const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const connection = require("../db/mysql-connection");

// @desc        모든 책 목록 가져오기
// @route       GET /api/v1/rentals
// @request     *
// @response    {success:true, rows:rows, count:count}
exports.getBooks = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  let query = `select * from book limit ${offset},${limit}`;

  try {
    const [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, rows: rows, count: count });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "책데이터 전부 가져오는데 에러 발생" });
    return;
  }
};

// @desc        한권대여하기
// @route       POST /api/v1/rentals
// @request     limit_age, age, limit_date
// @response    success
exports.book_rental = async (req, res, next) => {
  let user_id = req.user.id;
  let age = req.user.age;
  let book_id = req.body.book_id;
  let limit_age;

  let currentTime = Date.now(); // 밀리세컨즈 1000 = 1초
  let compareTime = currentTime + 1000 * 60 * 30 * 48 * 7;
  let limit_date = moment(compareTime).format("YYYY-MM-DD HH:mm:ss");

  let query = `select * from book where id = ${book_id}`;
  try {
    [rows] = await connection.query(query);
    limit_age = rows[0].limit_age;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  if (age < limit_age) {
    res.status(500).json({ success: false, message: "연령제한" });
    return;
  }

  query = `insert into book_rental (book_id, user_id, limit_date) values (${book_id}, ${user_id}, "${limit_date}")`;

  try {
    [result] = await connection.query(query);
    res
      .status(200)
      .json({ success: true, result: result, message: "책 대여 성공" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc        대여 목록 불러오기
// @route       GET /api/v1/rentals/rentalList
// @request     *
// @response    {success:true, result:result, count:count}
exports.myRentalList = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let user_id = req.user.id;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  let query = `select * from book_rental where user_id = ${user_id} limit ${offset},${limit}`;

  try {
    const [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, rows: rows, count: count });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "책데이터 전부 가져오는데 에러 발생" });
    return;
  }
};

// @desc        반납하기
// @route       DELETE /api/v1/rentals
// @request     rental_id
// @response    success
exports.book_return = async (req, res, next) => {
  let rental_id = req.params.rental_id;

  let query = `delete from book_rental where id = ${rental_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, message: "반납 완료" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
