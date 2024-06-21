import express from "express";
import { login, register, verify } from "../controllers/user.controller";

export const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.get("/verify", verify);
userRouter.post("/login", login);
