import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "./models/modelAdmin.js";

dotenv.config(); // Load biến môi trường từ file .env
console.log("MONGO_URL từ .env:", process.env.MONGO_URL); 
const mongoURI = process.env.MONGO_URL;

if (!mongoURI) {
  console.error("❌ Lỗi: MONGO_URL không được định nghĩa trong .env");
  process.exit(1); // Thoát chương trình nếu không có URL
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch(err => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const username = "admin";
    const password = "123";

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log("⚠️ Admin đã tồn tại!");
      mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });

    await newAdmin.save();
    console.log("✅ Admin đã được tạo thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
