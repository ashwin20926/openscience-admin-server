import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');

export const getDashboardStats = (req: Request, res: Response) => {
  try {
    const query = `SELECT count(DISTINCT wp_journals.journal_name) as journal_count, count(DISTINCT wp_journal_main_categories.category_name) as category_count FROM wp_journals INNER JOIN wp_journal_main_categories on wp_journals.main_category_id = wp_journal_main_categories.category_id ORDER BY wp_journals.journal_name`;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data[0];
      return res.status(200).json({ data: result });
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    return res.status(500).json({ message: error.message });
  }
}

export const getSupliTypeById = (req: Request, res: Response) => {
  try {
    // 1. FIX: Changed req.body to req.params to match /:id
    const { id } = req.params; 

    // 2. FIX: Replaced direct string interpolation with a safe "?" placeholder
    const query = `SELECT * FROM wp_supli_types WHERE id = ? AND deleted = 1`;
    
    // Pass [id] as the second argument to safely inject it into the "?" parameter
    db.query(query, [id], (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      return res.status(200).json({ data: result });
    });
    
  } catch(err: any) {
    const error = new HttpError('Failed to load data', 500);
    return res.status(500).json({ message: error.message });
  }
};


export const saveOrUpdateSupliType = (req: Request, res: Response) => {
  try {
    const id = req.params.id || req.body.id || null;
    const { supli_name, journal_id } = req.body;

    const today = new Date().toISOString().slice(0, 10);

    if (!supli_name || !journal_id) {
      return res.status(400).json({
        message: 'Missing supli_name or journal_id',
      });
    }

    // ============================================
    // UPDATE
    // ============================================
    if (id) {
      const updateQuery = `
        UPDATE wp_supli_types
        SET
          supli_name = ?,
          journal_id = ?,
          updated_date = ?
        WHERE id = ?
      `;

      db.query(
        updateQuery,
        [supli_name, journal_id, today, id],
        (err: any, result: any) => {
          if (err) {
            console.error('Update error:', err);

            return res.status(500).json({
              message: 'Update failed',
              error: err,
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: 'Supli Type not found',
            });
          }

          return res.status(200).json({
            message: 'Supli Type updated successfully',
            data: result,
          });
        }
      );

      return;
    }

    // ============================================
    // CHECK DUPLICATE BEFORE INSERT
    // ============================================
    const checkQuery = `
      SELECT id
      FROM wp_supli_types
      WHERE supli_name = ?
        AND journal_id = ?
        AND deleted = '1'
      LIMIT 1
    `;

    db.query(
      checkQuery,
      [supli_name, journal_id],
      (checkErr: any, rows: any[]) => {
        if (checkErr) {
          console.error('Duplicate check error:', checkErr);

          return res.status(500).json({
            message: 'Duplicate check failed',
            error: checkErr,
          });
        }

        // ========================================
        // ALREADY EXISTS
        // ========================================
        if (rows.length > 0) {
          return res.status(409).json({
            message: 'Supli Type already exists',
            data: {
              id: rows[0].id,
            },
          });
        }

        // ========================================
        // INSERT
        // ========================================
        const insertQuery = `
          INSERT INTO wp_supli_types
          (
            supli_name,
            journal_id,
            updated_date,
            created_date,
            deleted
          )
          VALUES (?, ?, ?, ?, '1')
        `;

        db.query(
          insertQuery,
          [supli_name, journal_id, today, today],
          (insertErr: any, result: any) => {
            if (insertErr) {
              console.error('Insert error:', insertErr);

              return res.status(500).json({
                message: 'Insert failed',
                error: insertErr,
              });
            }

            return res.status(201).json({
              message: 'Supli Type added successfully',
              data: result,
            });
          }
        );
      }
    );

  } catch (err: any) {
    console.error('Request error:', err);

    return res.status(500).json({
      message: err.message || 'Failed to process request',
    });
  }
};


export const getSupliTypes = (req: Request, res: Response) => {
  try {
    const query = `
      SELECT *
      FROM wp_supli_types
      WHERE deleted = '1'
    `;

    db.query(query, (err, data: any) => {
      if (err) {
        console.error('Failed to load supplier types:', err);

        return res.status(500).json({
          message: 'Failed to load data',
          error: err,
        });
      }

      return res.status(200).json({
        data: data,
      });
    });
  } catch (err: any) {
    const error = new HttpError('Failed to load data', 500);

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const getSiteMapTrackings = (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM sitemap_tracking ORDER BY generated_on DESC LIMIT 1`;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data[0];
      return res.status(200).json({ data: result });
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    return res.status(500).json({ message: error.message });
  }
}


export const deleteSupliType = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_supli_types\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Supli Type deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete Supli Type', 500);
    return res.status(500).json({ message: error.message });
  }
};