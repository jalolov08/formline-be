import express from "express";
import checkAuth from "../utils/checkAuth";
import checkVerified from "../utils/checkVerified";
import {
  createForm,
  deleteForm,
  editForm,
  exportForm,
  myForms,
} from "../controllers/form.controller";
import {
  deleteApplications,
  getApplications,
} from "../controllers/application.controller";

export const formRouter = express.Router();

formRouter.post("/new", checkAuth, checkVerified, createForm);
formRouter.get("/my", checkAuth, checkVerified, myForms);
formRouter.put("/:formId/edit", checkAuth, checkVerified, editForm);
formRouter.delete("/:formId/delete", checkAuth, checkVerified, deleteForm);
formRouter.get(
  "/:trackId/applications/",
  checkAuth,
  checkVerified,
  getApplications
);
formRouter.delete(
  "/:trackId/delete/applications",
  checkAuth,
  checkVerified,
  deleteApplications
);
formRouter.get("/:trackId/export", checkAuth, checkVerified, exportForm);
