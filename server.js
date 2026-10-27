const dotenv = require("dotenv").config();
const app = require("./app");
app.get("/", (req, res) => {
  res.send("Backend is live ✅");
});

const PORT = process.env.PORT || 5001;

// ✅ Use 0.0.0.0 so Render can expose the server publicly
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
