import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";

async function checkVerified(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(403).json({
      msg: "Нет доступа: пользователь не аутентифицирован",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        msg: "Нет доступа: пользователь не найден",
      });
    }

    if (user.verified === true) {
      next();
    } else {
      return res.status(403).json({
        msg: "Нет доступа: пользователь не верифицирован",
      });
    }
  } catch (error) {
    console.error("Ошибка при проверке верификации пользователя:", error);
    return res.status(500).json({
      msg: "Ошибка сервера при проверке верификации пользователя",
    });
  }
}

export default checkVerified;
