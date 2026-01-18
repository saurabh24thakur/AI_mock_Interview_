import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGO_URL:", process.env.MONGO_URL); 
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(` Error occured during MongoDB connection: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;