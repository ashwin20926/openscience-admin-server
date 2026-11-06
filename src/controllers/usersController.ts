import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');
import bcrypt from "bcryptjs";

export const getUsers = (req: Request, res: Response) => {
  try {
    const query = `SELECT u.*, r.id as roleId, r.name as roleName FROM users u LEFT JOIN roles r ON u.role = r.id  WHERE r.id != 1`;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      res.json({users: result});
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    //return next(error)
  }
}

export const createUser = async(req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    db.query(query, [name, email, hashedPassword, 2], async (err, data: any) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User created successfully' });
    });
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    //return next(error)
  }
}

export const updateUser = async(req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, status } = req.body;

    let query = `UPDATE users SET name = ?, email = ?`;
    let values: any[] = [name, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      values.push(hashedPassword);
    }

    if (status !== undefined) {
      query += `, status = ?`;
      values.push(status);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    db.query(query, values, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User updated successfully' });
    });
  } catch(err) {
    const error = new HttpError('Failed to update user', 500)
    //return next(error)
  }
}
