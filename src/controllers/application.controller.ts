import { Request, Response } from "express";
import Form from "../models/form.model";
import Application from "../models/application.model";
import { FormType } from "../types/form.type";
import User from "../models/user.model";
import mongoose from "mongoose";

export async function newApplication(req: Request, res: Response) {
  const { ...fields } = req.body;
  const { trackId } = req.params;

  try {
    const formDetails: FormType | null = await Form.findOne({ trackId });
    if (!formDetails) {
      return res.status(404).json({ error: "Форма не найдена" });
    }

    const validFormFields: string[] = formDetails.fields;

    const applicationFields: any = {};

    validFormFields.forEach((key) => {
      if (fields[key] !== undefined && fields[key] !== null) {
        applicationFields[key] = fields[key];
      } else {
        applicationFields[key] = "";
      }
    });

    if (Object.keys(fields).length === 0) {
      return res
        .status(400)
        .json({ error: "Пожалуйста введите корректные поля" });
    }

    if (
      Object.keys(fields).length === 1 &&
      Object.keys(applicationFields).length === 0
    ) {
      const key = Object.keys(fields)[0];
      applicationFields[key] = fields[key];
    }

    const newApplication = new Application({
      formTrackId: formDetails.trackId,
      fields: applicationFields,
    });

    const savedApplication = await newApplication.save();

    res.status(201).json({
      message: "Форма успешно отправлена.",
      application: savedApplication,
    });
  } catch (error) {
    console.error("Ошибка при отправке формы", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
}
export async function getApplications(req: Request, res: Response) {
  const userId = req.user?._id;
  const { trackId } = req.params;
  const { page, rows, q } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;
  const pageSize = parseInt(rows as string, 10) || 10;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const form = await Form.findOne({ trackId });
    if (!form) {
      return res.status(404).json({ message: "Форма не найдена" });
    }
    if (form.owner !== userId) {
      return res.status(403).json({
        message: "Вы не авторизованы для получения заявок этой формы",
      });
    }

    let applicationsQuery = Application.find({ formTrackId: trackId });

    if (q) {
      const fields = form.fields;

      const searchConditions = fields.map((field) => ({
        [`fields.${field}`]: { $regex: q as string, $options: "i" },
      }));

      applicationsQuery = applicationsQuery.where({ $or: searchConditions });
    }

    const applications = await applicationsQuery
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      message: "Заявки успешно получены",
      applications,
      totalPages: Math.ceil(applications.length / pageSize),
      currentPage: pageNumber,
      pageSize,
      totalApplications: applications.length,
    });
  } catch (error) {
    console.error("Ошибка при получении заявок.", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function deleteApplications(req: Request, res: Response) {
  const userId = req.user?._id;
  const { trackId } = req.params;
  const { applications } = req.body as { applications?: string[] };

  try {
    if (!applications || !Array.isArray(applications)) {
      return res
        .status(400)
        .json({ message: "Заявки должны быть предоставлены в виде массива" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const form = await Form.findOne({ trackId });
    if (!form) {
      return res.status(404).json({ message: "Форма не найдена" });
    }
    if (form.owner !== userId) {
      return res.status(403).json({
        message: "Вы не авторизованы для удаления заявок этой формы",
      });
    }

    const isValidObjectIds = applications.every((appId) =>
      mongoose.Types.ObjectId.isValid(appId)
    );
    if (!isValidObjectIds) {
      return res
        .status(400)
        .json({ message: "Один или несколько ID заявок недействительны" });
    }

    for (const appId of applications) {
      const deletedApplication = await Application.findOneAndDelete({
        _id: appId,
        formTrackId: form.trackId,
      });

      if (!deletedApplication) {
        console.warn(`Заявка с ID ${appId} не найдена`);
      }
    }

    res.status(200).json({ message: "Заявки успешно удалены" });
  } catch (error) {
    console.error("Ошибка при удалении заявок.", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
