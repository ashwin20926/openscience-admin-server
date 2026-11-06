import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');

export const getContactEnquiries = (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM \`wp_contact_enquiries\` WHERE deleted = 1 ORDER BY CASE WHEN read_status = 2 THEN 0 ELSE 1 END, created_date DESC  `;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      return res.status(200).json({ data: result });
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    return res.status(500).json({ message: error.message });
  }
}

export const deleteContactEnquiry = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_contact_enquiries\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Contact enquiry deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete contact enquiry', 500);
    return res.status(500).json({ message: error.message });
  }
};

export const updateContactEnquiryStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { read_status } = req.body;

  if (!id || read_status === undefined) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const query = `UPDATE wp_contact_enquiries SET read_status = ? WHERE id = ?`;
  db.query(query, [read_status, id], (err: any, result: any) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: 'Status updated successfully', data: result });
  });
};
