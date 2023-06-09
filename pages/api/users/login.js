import nc from "next-connect";
import bcrypt from "bcryptjs";
import User from "../../../models/User";
import db from "../../../utils/db";
import { signToken } from "../../../utils/auth";

const handler = nc();

handler.post(async (req, res) => {
  try {
    await db.connect();
    const user = await User.findOne({ email: req.body.email });
    console.log("user:", user);
    await db.disconnect();
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      const token = signToken(user);
      res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

export default handler;
