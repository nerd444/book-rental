const jwt = require("jsonwebtoken");
const connection = require("../db/mysql-connection");

const auth = async (req, res, next) => {
  let token;
  try {
    token = req.header("Authorization");
    token = token.replace("Bearer ", "");
    if (!token) {
      req.status(401).json({ error: "NOT token" });
      return;
    }
  } catch (e) {
    res.status(401).json();
    return;
  }

  console.log(token);

  let user_id;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    user_id = decoded.user_id;
  } catch (e) {
    res.status(401).json({ error: "이상한 토큰입니다" });
    return;
  }

  let query =
    "select u.id, u.email, u.age, t.token \
  from book_user as u \
  join book_user_token as t \
  on u.id = t.user_id \
  where t.user_id = ? and t.token = ?;";

  let data = [user_id, token];

  try {
    [rows] = await connection.query(query, data);
    if (rows.length == 0) {
      res.status(401).json();
      return;
    } else {
      req.user = rows[0];
      next();
    }
  } catch (e) {
    res.status(500).json();
    return;
  }
};

module.exports = auth;
