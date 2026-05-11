require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/users.route");
const guideRoutes = require("./src/routes/guides.route");
const tourRoutes = require("./src/routes/tours.route");
const vnpayRoutes = require("./src/routes/vnpay.route");
const bookingRoutes = require("./src/routes/bookings.route");
const messageRoutes = require("./src/routes/messages.route");
const dashboardRoutes = require("./src/routes/dashboard.route");
const notificationRoutes = require("./src/routes/notifications.route");
const aiRoutes = require("./src/routes/ai.route");


const app = express();
connectDB().then(() => {
    // Tự động dọn dẹp Index cũ bị lỗi
    mongoose.connection.db.collection('booking_infos').dropIndex('booking_id_1').catch(() => {
        // Bỏ qua nếu index không tồn tại
    });
});
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/vnpay", vnpayRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

app.use(express.static(path.join(__dirname, "admin")));

app.get("/", (req, res) => {
  res.redirect("/home/home.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
