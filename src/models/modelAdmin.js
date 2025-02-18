import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Tạo model Admin từ schema
const Admin = mongoose.model("admins", AdminSchema);

// Xuất model Admin thay vì chỉ xuất schema
export default Admin;
