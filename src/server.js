import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // File cấu hình MongoDB
import User from './models/modelUser.js'; // Import model User
import Post from './models/modelPost.js'
import Admin from './models/modelAdmin.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import unorm from 'unorm';
import mongoose from 'mongoose';
import Favourite from './models/modelFavourite.js';
import Booking from './models/modelBooking.js';
import moment from 'moment-timezone';
const app = express();
const PORT = 5000;
dotenv.config(); // Load biến môi trường từ file .env
console.log("MONGO_URL từ .env:", process.env.MONGO_URL); 


// Middleware
app.use(cors());
app.use(express.json());

// Kết nối đến MongoDB
connectDB();

// connectDB().then(async () => {
//   try {
//     // Chỉ cập nhật các bản ghi có `price` là chuỗi
//     const result = await Post.updateMany(
//       { roomarea: { $type: "string" } },  // Chỉ chọn các bản ghi có price là chuỗi
//       [{ $set: { roomarea: { $toInt: "$roomarea" } } }] // Chuyển đổi từ chuỗi sang số
//     );

//     console.log(`✅ Đã cập nhật ${result.modifiedCount} bản ghi.`);
//   } catch (error) {
//     console.error("❌ Lỗi khi cập nhật price:", error);
//   }
// });






app.post('/favourites', async (req, res) => {
  const { userId, postId } = req.body;
  console.log("Dữ liệu nhận được từ client:", req.body); // Log dữ liệu nhận được

  try {
    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId trong yêu cầu.' });
    }

    let userFavourites = await Favourite.findOne({ userId });

    // Nếu chưa tồn tại danh sách yêu thích, tạo mới
    if (!userFavourites) {
      userFavourites = new Favourite({ userId, favourites: [] });
    }

    // Chuyển postId về ObjectId nếu cần thiết
    const formattedPostId = postId.toString(); // Chắc chắn là string

    // Kiểm tra nếu bài viết đã tồn tại trong danh sách yêu thích
    const existingIndex = userFavourites.favourites.findIndex(
      (fav) => fav.postId.toString() === formattedPostId
    );

    if (existingIndex !== -1) {
      // Nếu bài viết đã tồn tại, xóa khỏi danh sách yêu thích
      userFavourites.favourites.splice(existingIndex, 1);
      await userFavourites.save();
      return res.status(200).json({ 
        message: 'Đã xóa khỏi danh sách yêu thích.', 
        isFavourite: false  // ✅ Trả về trạng thái để cập nhật UI
      });
    }

    // Nếu bài viết chưa tồn tại, thêm vào danh sách yêu thích
    userFavourites.favourites.push({ postId: formattedPostId });
    await userFavourites.save();

    res.status(200).json({ 
      message: 'Đã lưu vào danh sách yêu thích.', 
      isFavourite: true  // ✅ Trả về trạng thái để cập nhật UI
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});




app.get('/favourites/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Tìm danh sách yêu thích của người dùng
    const userFavourites = await Favourite.findOne({ userId });

    if (!userFavourites) {
      return res.status(200).json({ isFavourite: false, posts: [] });
    }

    // Lấy danh sách ID bài viết yêu thích
    const postIds = userFavourites.favourites.map(fav => fav.postId.toString());

    // Truy vấn tất cả bài viết theo ID
    const posts = await Post.find({ _id: { $in: postIds } });

    // Trả về danh sách bài viết yêu thích
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


app.get('/favourites/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;

  try {
    if (!userId || !postId) {
      return res.status(400).json({ message: 'Thiếu userId hoặc postId.' });
    }

    const userFavourites = await Favourite.findOne({ userId });
    if (!userFavourites) {
      return res.status(200).json({ isFavourite: false });
    }

    const isFavourite = userFavourites.favourites.some(fav => fav.postId.toString() === postId);
    res.status(200).json({ isFavourite });
  } catch (error) {
    console.error("Lỗi kiểm tra yêu thích:", error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// API để tạo booking
app.post('/booking', async (req, res) => {
  let { userId, requestuserId, postId, name, phone, viewDate, viewTime } = req.body;

// Chuyển đổi sang múi giờ Việt Nam
const formattedDate = moment.tz(viewDate, "Asia/Ho_Chi_Minh").toDate();
  console.log("🔥 Dữ liệu nhận từ client:", req.body);

  try {
    

    const booking = new Booking({
      userId,
      requestuserId,
      postId,
      name,
      phone,
      viewDate: formattedDate, // Lưu vào MongoDB dưới dạng Date
      viewTime,
    });

    await booking.save();
    res.status(200).json({ message: 'Booking thành công!', booking });

  } catch (error) {
    console.error("Lỗi API:", error);
    res.status(500).json({ message: 'Lỗi tạo booking', error });
  }
});



// API lấy tất cả đặt phòng với phân trang
app.get("/bookings", async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; // Trang hiện tại
      const limit = parseInt(req.query.limit) || 10; // Số lượng đặt phòng mỗi trang
      const skip = (page - 1) * limit;
      const { postId } = req.query; // Lấy postId từ query nếu có

      // Điều kiện tìm kiếm (nếu có postId thì lọc theo postId)
      const filter = postId ? { postId } : {};

      // Lấy danh sách đặt phòng theo trang và populate postId để lấy thông tin phòng trọ
      const bookings = await Booking.find(filter)
          .populate("postId") // Lấy toàn bộ thông tin phòng trọ
          .skip(skip)
          .limit(limit);

      // Đếm tổng số đặt phòng (có thể kèm postId nếu có)
      const totalBookings = await Booking.countDocuments(filter);

      res.json({ bookings, totalBookings });
  } catch (error) {
      console.error("Lỗi khi lấy danh sách đặt phòng:", error);
      res.status(500).json({ error: "Lỗi server" });
  }
});



/// xac nhan
app.post('/bookings/:bookingId/approve', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'approved' }, { new: true });
    res.status(200).send(booking);
  } catch (error) {
    res.status(500).send({ message: 'Error approving booking', error });
  }
});

app.post('/bookings/:bookingId/reject', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { status: 'rejected' }, 
      { new: true }
    );

    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    res.status(200).send(booking);
  } catch (error) {
    res.status(500).send({ message: 'Error rejecting booking', error });
  }
});




app.get('/bookings/users/:requestuserId', async (req, res) => {
  const { requestuserId } = req.params;
  console.log('Received requestuserId:', requestuserId);

  try {
    const objectId = new mongoose.Types.ObjectId(requestuserId);
    console.log('Converted ObjectId:', objectId);

    // Lấy danh sách các booking của người dùng, đồng thời populate postId để lấy thông tin phòng trọ
    const bookings = await Booking.find({ requestuserId: objectId }).populate('postId');

    if (!bookings.length) {
      return res.status(200).send([]);
    }

    // Trả về dữ liệu booking kèm thông tin phòng trọ
    const bookingDetails = bookings.map(booking => ({
      _id: booking._id, // ID của booking
      requestuserId: booking.requestuserId,
      postId: booking.postId ? booking.postId._id : null, // ID của phòng trọ
      viewDate: booking.viewDate,
      viewTime: booking.viewTime,
      name: booking.name,
      phone: booking.phone,
      status: booking.status,
      createdAt: booking.createdAt,
      
      // Thông tin phòng trọ từ postId
      roomDetails: booking.postId
        ? {
            _id: booking.postId._id,
            title: booking.postId.title,
            price: booking.postId.price,
            roomnull: booking.postId.roomnull,
            utilities: booking.postId.utilities,
            roomarea: booking.postId.roomarea,
            description: booking.postId.description,
            contactName: booking.postId.contactName,
            contactPhone: booking.postId.contactPhone,
            images: booking.postId.images,
            userId: booking.postId.userId,
            category: booking.postId.category,
            createdAt: booking.postId.createdAt,
            address: booking.postId.address,
            comments: booking.postId.comments
          }
        : null
    }));

    res.status(200).send(bookingDetails);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send({ message: 'Error fetching bookings', error });
  }
});



const Schema = mongoose.Schema;
const searchHistorySchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tham chiếu đến user
  keywords: [String], // Mảng chứa các từ khóa tìm kiếm
  createdAt: { type: Date, default: Date.now }, // Ngày tạo
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export default SearchHistory;


app.post('/change-password', async (req, res) => {
  
  const { userId, oldPassword, newPassword } = req.body;
  console.log('Received request to change password');
  console.log('Request body:', req.body);

  try {
    // Tìm người dùng theo userId
    const user = await User.findById(userId);

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Mật khẩu cũ không đúng' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới vào cơ sở dữ liệu
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Có lỗi xảy ra' });
  }
});


app.post('/update-profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, phone } = req.body;
  console.log('Received data:', { userId, name, phone });

  // Kiểm tra thông tin có đầy đủ không
  if (!userId || !name || !phone) {
    console.log('Missing information');
    return res.status(400).json({ message: 'Thông tin không đầy đủ!' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name: name, phone: phone },
      { new: true }
    );

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    console.log('User updated successfully');
    return res.status(200).json({ message: 'Cập nhật thành công!' });
  } catch (error) {
    console.error('Error in server:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại!' });
  }
});



/// API lưu từ khóa tìm kiếm
app.post('/save-keyword', async (req, res) => {
  const { query, userId, deleteQuery } = req.body;  // 'deleteQuery' là từ khóa muốn xóa (nếu có)

  // Kiểm tra dữ liệu đầu vào
  if (!userId) {
    console.error('Missing userId');
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // Kiểm tra userId có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId:', userId);
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Tìm kiếm lịch sử tìm kiếm của người dùng
    const existingHistory = await SearchHistory.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (existingHistory) {
      // Nếu yêu cầu xóa từ khóa
      if (deleteQuery) {
        // Loại bỏ từ khóa muốn xóa nếu có
        const index = existingHistory.keywords.indexOf(deleteQuery);
        if (index !== -1) {
          existingHistory.keywords.splice(index, 1);
          console.log('Keyword deleted from search history');
        }
      } else {
        // Kiểm tra xem từ khóa đã tồn tại trong lịch sử tìm kiếm chưa
        const index = existingHistory.keywords.indexOf(query);
        if (index !== -1) {
          // Nếu từ khóa đã tồn tại, loại bỏ từ khóa cũ
          existingHistory.keywords.splice(index, 1);
        }
        // Thêm từ khóa mới vào đầu mảng
        existingHistory.keywords.unshift(query);
        // Nếu có hơn 10 từ khóa, loại bỏ từ khóa cũ nhất
        if (existingHistory.keywords.length > 10) {
          existingHistory.keywords.pop(); // Loại bỏ từ khóa cuối cùng
        }
      }
      await existingHistory.save();
      console.log('Search history updated');
    } else {
      // Nếu chưa có lịch sử, tạo mới tài liệu
      const newHistory = new SearchHistory({
        userId: new mongoose.Types.ObjectId(userId), // Sử dụng 'new' để khởi tạo ObjectId
        keywords: [query], // Tạo mảng chứa từ khóa
      });
      await newHistory.save();
      console.log('New search history created');
    }

    return res.status(200).json({ message: 'Search history updated successfully' });
  } catch (err) {
    console.error('Error saving keyword:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


/// lay tu khoa tim kiem
app.get('/get-search-history', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // Lấy lịch sử tìm kiếm của người dùng
    const history = await SearchHistory.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (history) {
      return res.status(200).json(history.keywords); // Trả về mảng từ khóa
    } else {
      return res.status(404).json({ error: 'No search history found' });
    }
  } catch (err) {
    console.error('Error fetching search history:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


//// API tinh tong user va product
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Tổng số users
    const totalProducts = await Post.countDocuments(); // Tổng số bài đăng (products)

    res.status(200).json({ totalUsers, totalProducts });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});


/// API lay nguoi dùng
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Lấy số trang từ query, mặc định là trang 1
  const pageSize = 10; // Số người dùng hiển thị trên mỗi trang
  const skip = (page - 1) * pageSize; // Tính toán số bản ghi cần bỏ qua

  try {
    // Lấy tổng số người dùng
    const totalUsers = await User.countDocuments();

    // Lấy danh sách người dùng cho trang hiện tại
    const users = await User.find().skip(skip).limit(pageSize);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalUsers / pageSize);

    res.status(200).json({
      users,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
  }
});


app.get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const category = req.query.category;
  const search = req.query.search;
  const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null;
  const minSize = req.query.minSize ? parseInt(req.query.minSize) : null;
  const maxSize = req.query.maxSize ? parseInt(req.query.maxSize) : null;

  try {
    // Xây dựng bộ lọc
    let filter = {};

    // Lọc theo danh mục nếu có
    if (category) {
      filter.category = category.trim();
    }

    // Lọc theo từ khóa tìm kiếm (áp dụng trên title hoặc description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { _id: { $regex: search, $options: "i" } }
      ];
    }

    // Lọc theo giá nếu có minPrice hoặc maxPrice
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    // Lọc theo diện tích nếu có minSize hoặc maxSize
    if (minSize !== null || maxSize !== null) {
      filter.roomarea = {};
      if (minSize !== null) filter.roomarea.$gte = minSize;
      if (maxSize !== null) filter.roomarea.$lte = maxSize;
    }

    // Truy vấn dữ liệu theo bộ lọc
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      posts.forEach(post => {
        console.log('Post city:', post.city);  // Kiểm tra giá trị city của mỗi bài đăng
      });

    // Đếm tổng số bài đăng theo bộ lọc
    const totalPosts = await Post.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalPosts / limit);


    res.status(200).json({
      posts,
      totalPages,
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy bài đăng", error: error.message });
  }
});




  // API: Lấy chi tiết bài đăng theo ID
// API trên backend
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
 
  
  try {
    const product = await Post.findById(id); // Tìm kiếm sản phẩm theo ID
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res.status(200).json(product);  // Trả về dữ liệu sản phẩm
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
});


  

  app.post('/posts', async (req, res) => {
    const { title, price, roomnull, utilities, roomarea, description, contactName, contactPhone, images, address, userId, category } = req.body;
  
    // Kiểm tra xem các trường có bị thiếu không
    if ( !title || !price || !roomnull || !utilities || !roomarea || !description || !contactName || !contactPhone || !images || !address || !userId || !category ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!["Phòng trọ", "Căn hộ", "Nhà nguyên căn"].includes(category)) {
      return res.status(400).json({ error: "Danh mục không hợp lệ" });
    }
    console.log(req.body); // Xem dữ liệu từ client gửi lên
    try {
      // Nếu có ảnh, thay thế đường dẫn cục bộ bằng URL từ Cloudinary
      const imageUrls = [];
      for (let image of images) {
        if (typeof image === 'string' && image.startsWith('data:image/')) {
          // Nếu image là chuỗi và là base64, upload lên Cloudinary
          const result = await cloudinary.uploader.upload(image, { resource_type: 'auto' });
          imageUrls.push(result.secure_url);
        } else {
          // Nếu là URL đã có, chỉ cần thêm vào mảng
          imageUrls.push(image);
        }
      }
  
      // Tạo mới bài đăng với trường addressNoAccent
      const newPost = new Post({
        title,
        price,
        roomnull,
        utilities,
        roomarea,
        description,
        contactName,
        contactPhone,
        images: imageUrls, // Lưu danh sách URL ảnh
        address,
        userId,
        category
      });
  
      // Lưu bài đăng vào cơ sở dữ liệu
      await newPost.save();
  
      // Trả về thông báo thành công
      res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: err });
    }
  });

  

//// API chỉnh sửa thông tin nguười udngf
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  let { name, phone, password } = req.body;

  try {
    // Kiểm tra nếu có mật khẩu mới thì mã hóa trước khi cập nhật
    if (password) {
      const salt = await bcrypt.genSalt(10); // Tạo salt
      password = await bcrypt.hash(password, salt); // Mã hóa mật khẩu
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, phone, ...(password && { password }) }, // Chỉ cập nhật password nếu có
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

/// API xoa nguoi dung 
// API xóa người dùng
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

/// api thwm nguoi dung
app.post('/api/users', async (req, res) => {
  console.log("Received data:", req.body); // Kiểm tra dữ liệu client gửi
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Failed to add user', error: error.message });
  }
});

app.delete('/api/posts/:postId', async (req, res) => {
  const postId = req.params.postId;
  console.log("Xóa bài đăng với postId: ", postId);  // In ra postId nhận được

  try {
    // Sử dụng Model Post để xóa bài đăng
    const result = await Post.deleteOne({ _id: postId }); // Sử dụng _id thay vì postId

    if (result.deletedCount === 1) {
      res.status(200).send({ message: 'Bài đăng đã được xóa thành công' });
    } else {
      res.status(404).send({ message: 'Bài đăng không tìm thấy' });
    }
  } catch (err) {
    console.log('Lỗi khi xóa bài đăng:', err);  // In log lỗi chi tiết
    res.status(500).send({ message: 'Lỗi server', error: err });
  }
});


app.put("/api/posts/:id", async (req, res) => {
  const { id } = req.params; // Lấy id từ URL
  const { facilities, roomType, ...otherFields } = req.body; // Thêm roomType vào đây

  try {
      // Kiểm tra nếu `facilities` không phải là mảng
      if (facilities && !Array.isArray(facilities)) {
          return res.status(400).json({ message: "Tiện ích (facilities) phải là một mảng." });
      }

      const post = await Post.findByIdAndUpdate(
          id,
          { ...otherFields, facilities, roomType }, // Đảm bảo roomType được cập nhật
          { new: true }
      );

      if (!post) {
          return res.status(404).json({ message: "Bài đăng không tồn tại." });
      }

      res.status(200).json(post);
  } catch (error) {
      console.error("Lỗi khi cập nhật bài đăng:", error);
      res.status(500).json({ message: "Lỗi máy chủ. Không thể cập nhật bài đăng." });
  }
});


/// api timf kiếm
app.get('/api/search', async (req, res) => {
  const { city, district, ward, category, minPrice, maxPrice, minSize, maxSize, page = 1, limit = 3 } = req.query;

  console.log("Dữ liệu nhận từ frontend:", req.query);

  try {
    let filter = {};

    // Hàm chuẩn hóa văn bản
    const normalizeText = (text) => {
      return text
        .replace(/(Thành phố |TP\.\s*)/i, "") // Loại bỏ "Thành phố" hoặc "TP."
        .replace(/(Quận |Huyện |Q\.\s*)/i, "") // Loại bỏ "Quận", "Huyện", "Q."
        .replace(/(Phường |Xã |P\.\s*)/i, "") // Loại bỏ "Phường", "Xã", "P."
        .trim();
    };

    // Lọc theo thành phố, quận, phường (bắt đầu với từ khóa và không phân biệt chữ hoa thường)
    if (city) {
      const normalizedCity = normalizeText(city);
      filter["address.city"] = { $regex: normalizedCity, $options: "i" };  // Tìm kiếm từ khóa không phân biệt hoa thường
    }
    if (district) {
      const normalizedDistrict = normalizeText(district);
      filter["address.district"] = { $regex: normalizedDistrict, $options: "i" };
    }
    if (ward) {
      const normalizedWard = normalizeText(ward);
      filter["address.ward"] = { $regex: normalizedWard, $options: "i" };
    }

    // Lọc theo loại hình bất động sản (category)
    if (category) filter["category"] = { $regex: category, $options: "i" };  // Tìm kiếm loại hình không phân biệt hoa thường

    // Lọc theo giá
    if (minPrice || maxPrice) {
      filter["price"] = {};
      if (minPrice) filter["price"].$gte = parseInt(minPrice);
      if (maxPrice) filter["price"].$lte = parseInt(maxPrice);
    }

    // Lọc theo diện tích
    if (minSize || maxSize) {
      filter["roomarea"] = {};
      if (minSize) filter["roomarea"].$gte = parseInt(minSize);
      if (maxSize) filter["roomarea"].$lte = parseInt(maxSize);
    }

    console.log("Điều kiện tìm kiếm (filter):", filter);

    // Phân trang (skip & limit)
    const skip = (page - 1) * limit;

    // Truy vấn MongoDB với điều kiện lọc và phân trang
    const posts = await Post.find(filter)
      .skip(skip) // Bỏ qua các bài đăng đã có trước đó
      .limit(parseInt(limit)) // Giới hạn số bài đăng trả về
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất)

    // Đếm tổng số kết quả để tính tổng trang
    const totalResults = await Post.countDocuments(filter);

    res.status(200).json({
      posts,
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy bài đăng", error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  // Kiểm tra đầu vào từ client
  if (!phone || !password) {
    console.error("[LOGIN ERROR] Thiếu số điện thoại hoặc mật khẩu");
    return res.status(400).json({ error: "Nhập đầy đủ thông tin" });
  }

  try {
    // Tìm người dùng trong MongoDB
    const user = await User.findOne({ phone });
    if (!user) {
      console.error(`[LOGIN ERROR] Không tìm thấy user với số điện thoại: ${phone}`);
      return res.status(404).json({ error: "Số điện thoại không đúng" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error(`[LOGIN ERROR] Sai mật khẩu cho số điện thoại: ${phone}`);
      return res.status(400).json({ error: "Sai mật khẩu" });
    }
    const JWT_SECRET = 'your_secret_key';

    // Tạo token JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    console.log(`[LOGIN SUCCESS] User ${phone} đã đăng nhập thành công.`);
    
    res.status(200).json({
      token,
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[LOGIN ERROR] Lỗi server:", err);
    res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau!" });
  }
});






app.post("/loginadmin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
  }

  try {
    // Tìm admin trong MongoDB
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ error: "Tài khoản không tồn tại" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Mật khẩu không đúng" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({
      token,
      message: "Đăng nhập thành công",
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau!" });
  }
});



app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});


