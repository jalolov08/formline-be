import express from "express";
import { userRouter } from "./user.route";

export const router = express.Router();
router.use("/user", userRouter);
