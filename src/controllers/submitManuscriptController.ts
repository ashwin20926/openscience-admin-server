import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');


export const getSubmitManuscripts = (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM wp_manuscript WHERE deleted = 1 ORDER BY CASE WHEN read_status = 2 THEN 0 ELSE 1 END, created_date DESC `;
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

export const updateSubmitManuscriptStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { read_status } = req.body;

    if (!id || read_status === undefined) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const query = `UPDATE wp_manuscript SET read_status = ? WHERE ID = ?`;
    db.query(query, [read_status, id], (err: any, result: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: 'Status updated successfully', data: result });
    });
  } catch (err) {
    const error = new HttpError('Failed to update status', 500);
    return res.status(500).json({ message: error.message });
  }
};


export const deleteSubmitManuscript = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const query = `UPDATE wp_manuscript SET deleted = 0 WHERE ID = ?`;
    db.query(query, [id], (err: any, result: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: 'Row deleted successfully', data: result });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete row', 500);
    return res.status(500).json({ message: error.message });
  }
};

export const getUnreadEnquiryCounts = (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM wp_manuscript WHERE deleted = 1 AND read_status = 2) AS submit_manuscripts,
        (SELECT COUNT(*) FROM wp_contact_enquiries WHERE deleted = 1 AND read_status = 2) AS contact_enquiries
    `;

    db.query(query, (err, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ data: data[0] || {} });
    });
  } catch (err) {
    const error = new HttpError('Failed to load unread enquiry counts', 500);
    return res.status(500).json({ message: error.message });
  }
};
