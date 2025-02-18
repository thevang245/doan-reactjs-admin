import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    roomnull: { type: String, required: true },
    utilities: { type: [String], required: true },
    roomarea: { type: Number, required: true },
    description: { type: String, required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    images: { type: [String], default: [] },
    address: {
      city: String,
      district: String,
      ward: String,
      street: String,
    },
    userId: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["Phòng trọ", "Căn hộ", "Nhà nguyên căn"], 
      required: true 
    }, // Thêm category
    createdAt: { type: Date, default: Date.now },
    comments: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true }, 
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
});

const Post = mongoose.model('Posts', PostSchema);
export default Post;
