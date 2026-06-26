import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { GenderEnum, RoleEnum } from "../common/index.js";
import { userModel } from "../DB/model/user.model.js";
import { DB_URI, SALT_ROUND } from "../../config/config.js";

const seedAdmin = async () => {

  await mongoose.connect(DB_URI);

  console.log(process.env.DB_URI);

  const exists = await userModel.findOne({ role: RoleEnum.Admin });

  if (!exists) {
    await userModel.create({
      fullName: "Sayed Nasser",
      email: "SayedAdmin123@gmail.com",
      password: await bcrypt.hash("Admin@123", SALT_ROUND),
      role: RoleEnum.Admin,
      phone: "01154063420",
      age: 25,
      gender: GenderEnum.male,

    });

    console.log("Admin Created ✅");
  } else {
    console.log("Admin already exists ⚠️");
  }

  process.exit();
};

seedAdmin();