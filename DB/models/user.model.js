import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      min:8,
      max:20,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: String,
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    forgetCode: String,
    activationCode: String,
    profilePic: {
      url: {
        type: String,
        default: "https://res.cloudinary.com/dunuxwvko/image/upload/v1691769236/e-commerce%20route/user/How-Do-You-Have-No-Profile-Picture-on-Facebook_25900_nyipn1.png"
      },
      id: {
        type: String,
        default: "e-commerce%20route/user/How-Do-You-Have-No-Profile-Picture-on-Facebook_25900_nyipn1"
      },
    },
    coverPic: [
      {
        url: {
          type: String,
          default: "https://res.cloudinary.com/dunuxwvko/image/upload/v1691769236/e-commerce%20route/user/How-Do-You-Have-No-Profile-Picture-on-Facebook_25900_nyipn1.png"
        },
        id: {
          type: String,
          default: "e-commerce%20route/user/How-Do-You-Have-No-Profile-Picture-on-Facebook_25900_nyipn1"
        },
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel
