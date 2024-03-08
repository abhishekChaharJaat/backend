const connectToMongo = require("./cdb");
const express = require("express");
const cors = require("cors");
connectToMongo();

const app = express();
const port = "https://inotebook-backend-6f8o.onrender.com/";
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

app.listen(port, () => {
  console.log(`App listen on port http://localhost:${port}`);
});
