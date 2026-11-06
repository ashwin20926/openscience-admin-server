import { Request, Response } from "express";
import { db } from "../config/db";
const HttpError = require('../models/http-error');

export const getEbMembersByJournalId = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `SELECT eb.id,eb.eb_post_slug,eb.eb_journal_slug,j.journal_name,mc.category_name,eb.eb_member_name,eb.eb_member_email, eb.eb_member_photo,eb.eb_member_country,eb.editor_chief,eb.eb_member_desc,eb.updated_date FROM wp_eb_members eb INNER JOIN wp_journals j on eb.journal_id = j.id INNER JOIN wp_journal_main_categories mc on mc.category_id = j.main_category_id WHERE eb.deleted="1" AND eb.journal_id = "${id}"`;

    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ data });
    });
  } catch (err) {
    const error = new HttpError('Failed to load data', 500);
    return res.status(500).json({ message: error.message });
  }
};


export const getEbMemberById = (req: Request, res: Response) => {
  try {
    // 1. FIX: Changed req.body to req.params to match /:id
    const { id } = req.params; 

    // 2. FIX: Replaced direct string interpolation with a safe "?" placeholder
    const query = `SELECT * FROM wp_eb_members WHERE id = ? AND deleted = 1`;
    
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


export const updateEbMember = (
  req: Request,
  res: Response
) => {
  try {
    const data = req.body || {};

    const {
      id,
      category_id = '',
      journal_id = '',
      eb_member_name = '',
      eb_member_email = '',
      eb_member_photo = '',
      eb_member_country = '',
      editor_chief = '0',
      eb_member_desc = '',
      eb_post_slug = '',
      eb_journal_slug = '',
    } = data;

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    /**
     * Normalize editor_chief.
     *
     * React sends:
     * "1" = Yes
     * "0" = No
     */
    const editorChief =
      String(editor_chief) === '1'
        ? '1'
        : '0';

    /**
     * UPDATE existing EB Member
     */
    if (id !== undefined && id !== null && id !== '') {
      const sql = `
        UPDATE wp_eb_members
        SET
          category_id = ?,
          journal_id = ?,
          eb_member_name = ?,
          eb_member_email = ?,
          eb_member_photo = ?,
          eb_member_country = ?,
          editor_chief = ?,
          eb_member_desc = ?,
          eb_post_slug = ?,
          eb_journal_slug = ?,
          updated_date = ?,
          deleted = ?
        WHERE id = ?
      `;

      const values = [
        category_id,
        journal_id,
        eb_member_name,
        eb_member_email,
        eb_member_photo,
        eb_member_country,
        editorChief,
        eb_member_desc,
        eb_post_slug,
        eb_journal_slug,
        today,
        '1',
        id,
      ];

      db.query(
        sql,
        values,
        (err: any, result: any) => {
          if (err) {
            console.error(
              'EB Member update error:',
              err
            );

            return res.status(500).json({
              status: false,
              message:
                'Failed to update EB Member',
              error: err.message,
            });
          }

          return res.json({
            status: true,
            message:
              'EB Member Updated Successfully',
            data: result,
          });
        }
      );

      return;
    }

    /**
     * INSERT new EB Member
     */
    const sql = `
      INSERT INTO wp_eb_members (
        category_id,
        journal_id,
        eb_member_name,
        eb_member_email,
        eb_member_photo,
        eb_member_country,
        editor_chief,
        eb_member_desc,
        eb_post_slug,
        eb_journal_slug,
        created_date,
        updated_date,
        deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      category_id,
      journal_id,
      eb_member_name,
      eb_member_email,
      eb_member_photo,
      eb_member_country,
      editorChief,
      eb_member_desc,
      eb_post_slug,
      eb_journal_slug,
      today,
      today,
      '1',
    ];

    db.query(
      sql,
      values,
      (err: any, result: any) => {
        if (err) {
          console.error(
            'EB Member insert error:',
            err
          );

          return res.status(500).json({
            status: false,
            message:
              'Failed to add EB Member',
            error: err.message,
          });
        }

        return res.json({
          status: true,
          message:
            'EB Member Added Successfully',
          data: result,
        });
      }
    );
  } catch (err: any) {
    console.error(
      'updateEbMember error:',
      err
    );

    return res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error:
        err?.message || String(err),
    });
  }
};

export const deleteEbMember = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_eb_members\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Eb Member deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete Eb Member', 500);
    return res.status(500).json({ message: error.message });
  }
};
