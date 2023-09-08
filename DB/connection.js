import mongoose from "mongoose";

const connection = async () => {
  await mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("connected successfully"))
    .catch(() => console.log("something went wrong"));
};

export default connection;
