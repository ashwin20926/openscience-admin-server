import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');


export const getMainCategories = async (req: Request, res: Response) => {
  try {
    const { search_text } = req.body;
    let query = `SELECT * FROM wp_journal_main_categories WHERE deleted = "1" order by updated_date DESC`
    if (search_text) {
      query = `SELECT * FROM wp_journal_main_categories WHERE deleted = "1" AND category_name LIKE "%'.${search_text}.'%" order by updated_date DESC`
    }
    
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      return res.status(200).json({ data: result });
    })
  } catch(err) {
    const error = new HttpError('Failed to load Data', 500)
    //return next(error);
  }
};

export const createMainCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const selectQuery = `SELECT * FROM wp_journal_main_categories WHERE category_name = ? AND deleted = 1`
    db.query(selectQuery, [name], (err, data: any) => {
      if (err) return res.status(500).json(err); 
      
      // 1. Check if it exists first
      if (data && data.length > 0) {
        return res.status(500).json({ message: 'Category name already exist' })
      }

      // 2. ONLY insert if the first query found nothing
      const insertQuery = `INSERT INTO wp_journal_main_categories (category_name) VALUES (?)`;
      db.query(insertQuery, [name], (insertErr, result) => {
        if (insertErr) return res.status(500).json(insertErr);
        
        return res.status(201).json({ message: 'Category created successfully' });
      });
     
    });
  } catch(err) {
    const error = new HttpError('Failed to load Data', 500)
    //return next(error);
  } 
}