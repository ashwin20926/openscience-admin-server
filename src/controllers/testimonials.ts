import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');

export const getTestimonials = (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM wp_testimonials WHERE deleted="1" ORDER BY created_date DESC`;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      res.json({users: result});
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
  }
}

export const addOrUpdateTestimonials = (req: Request, res: Response) => {

  try {
    const id = req.params.id || req.body.id || null;

    const {user_name, user_img, testimonial_desc, user_desig, user_university} = req.body;

    const today = new Date().toISOString().slice(0,10);

    if (!user_name || !user_img || !testimonial_desc || !user_desig || !user_university) {
      return res.status(400).json({ message: 'Invalid request, Required fileds are missing.'})
    }


    // UPDATE - ID PROVIDED
    if (id) {
      const updatedValues = [user_name, user_img, testimonial_desc, user_desig, user_university, today, id];
      const updatedQuery = `UPDATE wp_testimonials SET user_name = ?, user_img = ?, testimonial_Desc = ?, user_desig = ?, user_university = ?, updated_date = ? WHERE id = ?`;
      db.query(updatedQuery, updatedValues, (err: any, result: any) => {
        if (err) {
          console.error('Testimonials update failed');
          return res.status(500).json({
            message: 'Database update failed',
            error: err.message
          })       
        }
        // ID provided but record does not exist
        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: `Testimonial with ${id} not found`
          })
        }

        res.status(200).json({
          message: 'Testimonial updated successfully',
          data: result
        })
      });
      return;
    }

    //INSERT id not provided
    const updatedValues = [user_name, user_img, testimonial_desc, user_desig, user_university, today, today];
    const insertQuery = `INSERT INTO wp_testimonials(user_name, user_img, testimonial_desc, user_desig, user_university, created_date, updated_date) VALUES(?, ?, ?, ?, ?, ?, ?)`;
    db.query(insertQuery, updatedValues, (err: any, result: any) => {
      if (err) {
        console.log('Testimonials inset failed');
        return res.status(500).json({
          message: 'Database insert failed',
          error: err.message
        })
      }

      return res.status(200).json({
        message: 'Testimonial added successfully',
        data: result,
        status: true
      })
    })
  } catch (err: any) {
    console.error('Testimonial controller error:', err);
    return res.status(500).json({
      message: err?.message || 'Failed to process Testimonial request',
    });
  }
}

export const deleteTestimonial = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE wp_testimonials SET deleted=0 WHERE id=${id}`;
    db.query(query, (err: any, result: any) => {
      if (err) {
        return res.status(500).json({message: err.message})
      }
      return res.status(200).json({ message: 'Testimonial delete successfully', status: true})
    })
  } catch(err: any) {
    const error = new HttpError('Failed to delete Testimonial', 500);
    res.status(500).json({ message: error.message })
  }
}

export const getTestimonialById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM wp_testimonials WHERE id = ${id}`;
    db.query(query, (err: any, result: any) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to delete testimonial' });        
      }

      return res.status(200).json({ message: 'Testimonial Retrived Successfully', data: result})
    })
  } catch(err) {
    const error = new HttpError('Failed to get Testimonial', 500);
    res.status(500).json({ message: error.message })
  }
}