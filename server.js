const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// 내가 만든 파일 require는 이 아래에다가 넣자.
const users = require("./routes/users");

const app = express();
app.use(express.json());

app.use("/api/v1/users", users);

const PORT = process.env.PORT || 4040;

app.get("/", (req, res, next) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("App listening on port 4040!");
});
