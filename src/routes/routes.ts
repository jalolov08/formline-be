import express from "express";
import { userRouter } from "./user.route";
import { formRouter } from "./form.route";

export const router = express.Router();
router.use("/user", userRouter);
router.use("/form" , formRouter)
