import mongoose from 'mongoose';

const uri = 'mongodb+srv://ttv:1234@cluster0.ywarw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('Kết nối MongoDB thất bại:', error.message);
    process.exit(1);
  }
};

export default connectDB;
