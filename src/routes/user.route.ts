import express from "express";
import { getMe, login, register, verify } from "../controllers/user.controller";
import checkAuth from "../utils/checkAuth";

export const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.get("/verify", verify);
userRouter.post("/login", login);
userRouter.get("/me", checkAuth, getMe);
