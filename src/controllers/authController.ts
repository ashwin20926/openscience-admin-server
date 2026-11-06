import { Request, Response } from "express";
import { db } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?,?)",
    [name, email, hashedPassword, role],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json("User registered successfully");
    }
  );
};

// LOGIN
export const login = (req: Request, res: Response) => {
  //return;
  const { email, password } = req.body;

  db.query(
    "SELECT u.*, r.id as roleId, r.name as roleName FROM users u LEFT JOIN roles r ON u.role = r.id WHERE u.email = ?",
    [email],
    async (err, data: any) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0)
        return res.status(404).json("User not found");
      
      if (data[0].status !== 1)
        return res.status(403).json("User is inactive");

      const user = data[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(400).json("Invalid credentials");

      const secret = process.env.JWT_SECRET || "secretkey";
      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: "8h"
      });
      res.json({user: { token: token, id: user.id, name: user.name, email: user.email, roleId: user.roleId, roleName: user.roleName } });
    }
  );
};