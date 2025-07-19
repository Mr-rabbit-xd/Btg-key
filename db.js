import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
  key: String,
  type: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

export const Key = mongoose.model("Key", keySchema);

export const connectDB = async (uri) => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("✅ MongoDB Connected");
};
