import mongoose from 'mongoose';

const FavouriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    favourites: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

FavouriteSchema.index({ userId: 1 }, { unique: true });

const Favourite = mongoose.model('Favourite', FavouriteSchema);
export default Favourite;