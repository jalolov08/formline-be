import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import { Types } from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response) {
  const { name, surname, mail, password } = req.body;

  if (!name || !surname || !mail || !password) {
    return res.status(400).json({
      message: "Пожалуйста, заполните все поля: имя, фамилия, email, пароль",
    });
  }

  if (!emailRegex.test(mail)) {
    return res
      .status(400)
      .json({ message: "Пожалуйста, введите корректный email" });
  }

  try {
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      surname,
      mail,
      password: hashedPassword,
    });

    await newUser.save();
    // Send verification mail
    const token = generateToken(newUser);

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      user: {
        id: newUser._id,
        name: newUser.name,
        surname: newUser.surname,
        mail: newUser.mail,
      },
      token,
    });
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function verify(req: Request, res: Response) {
  const userId = req.query.user as string;

  try {
    const isValidObjectId = Types.ObjectId.isValid(userId);
    if (!isValidObjectId) {
      return res
        .status(400)
        .json({ message: "Неверный формат идентификатора пользователя" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Пользователь уже подтвержден" });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: "Пользователь успешно подтвержден" });
  } catch (error) {
    console.error("Ошибка при подтверждении пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function login(req: Request, res: Response) {
  const { mail, password } = req.body;

  try {
    const user = await User.findOne({ mail });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный пароль" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Успешный вход в систему",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        mail: user.mail,
      },
      token,
    });
  } catch (error) {
    console.error("Ошибка при входе в систему:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
export async function getMe(req: Request, res: Response) {
  const userId = req.user?._id;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res
      .status(200)
      .json({ message: "Данные пользователя успешно получены.", user });
  } catch (error) {
    console.error("Ошибка при получение пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
