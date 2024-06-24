import { Request, Response } from "express";
import Form from "../models/form.model";
import User from "../models/user.model";
import Application from "../models/application.model";
import fs from "fs";
import json2csv from "json2csv";
export async function createForm(req: Request, res: Response) {
  const userId = req.user?._id;
  const { name, targetMail } = req.body;

  try {
    if (!name || !targetMail) {
      return res.status(400).json({
        message: "Пожалуйста, заполните все поля",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const linkedMail = user.linkedMails.find((lm) => lm.mail === targetMail);

    if (!linkedMail) {
      return res.status(400).json({
        message: "Целевой адрес почты должен быть одним из связанных адресов",
      });
    }

    const newForm = new Form({
      name,
      targetMail,
      owner: userId,
    });

    await newForm.save();

    res.status(200).json({ message: "Форма успешно создана.", form: newForm });
  } catch (error) {
    console.error("Ошибка при создании формы:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function myForms(req: Request, res: Response) {
  const userId = req.user?._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const forms = await Form.find({ owner: user._id });
    res.status(200).json({ message: "Формы успешно получены.", forms });
  } catch (error) {
    console.error("Ошибка при получении форм:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function editForm(req: Request, res: Response) {
  const userId = req.user?._id;
  const { formId } = req.params;
  const { name, targetMail, fields, enabled, emailNotifications } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Форма не найдена" });
    }

    if (form.owner !== userId) {
      return res
        .status(403)
        .json({ message: "Вы не авторизованы для изменения этой формы" });
    }
    if (typeof targetMail !== "undefined") {
      const linkedMail = user.linkedMails.find((lm) => lm.mail === targetMail);

      if (!linkedMail) {
        return res.status(400).json({
          message: "Целевой адрес почты должен быть одним из связанных адресов",
        });
      }
    }
    if (name) {
      form.name = name;
    }

    if (targetMail) {
      form.targetMail = targetMail;
    }
    if (fields) {
      form.fields = fields;
    }
    if (enabled !== undefined) {
      form.enabled = enabled;
    }
    if (emailNotifications !== undefined) {
      form.emailNotifications = emailNotifications;
    }

    await form.save();

    res.status(200).json({ message: "Форма успешно обновлена", form });
  } catch (error) {
    console.error("Ошибка при изменении формы:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function deleteForm(req: Request, res: Response) {
  const userId = req.user?._id;
  const { formId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Форма не найдена" });
    }

    if (form.owner !== userId) {
      return res
        .status(403)
        .json({ message: "Вы не авторизованы для изменения этой формы" });
    }
    await Form.findByIdAndDelete(form._id);
    res.status(200).json({ message: "Форма успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удаление формы:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function exportForm(req: Request, res: Response) {
  const userId = req.user?._id;
  const { trackId } = req.params;
  const { type } = req.query;

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
        message: "Вы не авторизованы для удаления заявок этой формы",
      });
    }

    const applications = await Application.find({ formTrackId: trackId });

    if (type === "json") {
      const jsonFileName = `applications_${trackId}.json`;
      const jsonData = JSON.stringify(applications, null, 2);
      fs.writeFileSync(jsonFileName, jsonData);
      res.download(jsonFileName, jsonFileName, (err) => {
        if (err) {
          console.error("Ошибка при отправке файла JSON:", err);
          res.status(500).json({ message: "Ошибка при отправке файла JSON" });
        } else {
          fs.unlinkSync(jsonFileName);
        }
      });
    } else if (type === "csv") {
      const fields = form.fields.map((field) => `fields.${field}`);
      const csv = json2csv.parse(applications, { fields });
      const csvFileName = `applications_${trackId}.csv`;
      fs.writeFileSync(csvFileName, csv);

      res.download(csvFileName, csvFileName, (err) => {
        if (err) {
          console.error("Ошибка при отправке файла CSV:", err);
          res.status(500).json({ message: "Ошибка при отправке файла CSV" });
        } else {
          fs.unlinkSync(csvFileName);
        }
      });
    } else {
      res.status(400).json({ message: "Неподдерживаемый формат экспорта" });
    }
  } catch (error) {
    console.error("Ошибка при экспорте заявок:", error);
    res.status(500).json({ message: "Произошла ошибка при экспорте заявок" });
  }
}
