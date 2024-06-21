import express from "express";
import checkAuth from "../utils/checkAuth";
import checkVerified from "../utils/checkVerified";
import {
  createForm,
  deleteForm,
  editForm,
  myForms,
} from "../controllers/form.controller";

export const formRouter = express.Router();

formRouter.post("/new", checkAuth, checkVerified, createForm);
formRouter.get("/my", checkAuth, checkVerified, myForms);
formRouter.put("/:formId/edit", checkAuth, checkVerified, editForm);
formRouter.delete("/:formId/delete", checkAuth, checkVerified, deleteForm);
