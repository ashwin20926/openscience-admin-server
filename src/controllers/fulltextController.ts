import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');

export const getFullTextArticles = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(1, Number(req.query.pageSize) || 0);
    const shouldPaginate = !!req.query.page || !!req.query.pageSize;
    const offset = (page - 1) * (pageSize || 0);
    const countQuery = `SELECT COUNT(*) AS totalCount FROM wp_fulltextarticles WHERE post_type = 'post' AND deleted = '1'`;
    const selectAllQuery = `SELECT ID, post_title, post_browser_title, post_browser_title_slug, post_date FROM wp_fulltextarticles WHERE post_type = 'post' AND deleted = '1' ORDER BY post_date DESC`;
    const selectQuery = `SELECT ID, post_title, post_browser_title, post_browser_title_slug, post_date FROM wp_fulltextarticles WHERE post_type = 'post' AND deleted = '1' ORDER BY post_date DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const pool = db.promise();
    const [countResult] = await pool.query(countQuery);
    const totalCount = (countResult as any[])[0]?.totalCount || 0;
    const [data] = await pool.query(shouldPaginate ? selectQuery : selectAllQuery);

    return res.status(200).json({
      data,
      totalCount,
      page: shouldPaginate ? page : 1,
      pageSize: shouldPaginate ? pageSize : totalCount,
    });
  } catch (err) {
    const error = new HttpError('Failed to load data', 500);
    return res.status(500).json({ message: error.message });
  }
};

export const saveFullTextArticle = async (req: Request, res: Response) => {
  try {
    const data = req.body || {};
    const today = new Date().toISOString().slice(0, 10);
    const recordId = data.ID || data.id || null;
    const payload = {
      post_title: data.post_title || '',
      post_browser_title: data.post_browser_title || '',
      post_browser_title_slug: data.post_browser_title_slug || '',
      post_meta_keywords: data.post_meta_keywords || '',
      category_id: data.categoryId || data.category_id || '',
      journal_id: data.journal_id || '',
      submission_date: data.submission_date || '',
      publication_date: data.publication_date || '',
      accepted_date: data.accepted_date || '',
      citation_volume: data.citation_volume || '',
      citation_issue: data.citation_issue || '',
      citation_firstpage: data.citation_first_page || '',
      citation_lastpage: data.citation_last_page || '',
      authors: data.authors || '',
      post_content: data.post_content || '',
      json_format: data.json_format || 0,
      post_type: 'post',
      deleted: '1',
      post_date: today,
      post_modified: today,
      post_date_gmt: today,
      author_affliations: "",
      to_ping: "",
      pinged: "",
      post_modified_gmt: today,
      post_content_filtered: ""
    };

    const pool = db.promise();

    if (recordId) {
      const sql = `UPDATE wp_fulltextarticles SET post_content_filtered = ?, post_modified_gmt = ?, pinged = ?, to_ping = ?, author_affliations= ?, post_date_gmt = ?, post_title = ?, post_browser_title = ?, post_browser_title_slug = ?, post_meta_keywords = ?, category_id = ?, journal_id = ?, submission_date = ?, publication_date = ?, accepted_date = ?, citation_volume = ?, citation_issue = ?, citation_firstpage = ?, citation_lastpage = ?, authors = ?, post_content = ?, json_format = ?, post_type = ?, deleted = ?, post_modified = ? WHERE ID = ?`;
      const values = [
        payload.post_content_filtered,
        payload.post_modified_gmt,
        payload.pinged,
        payload.to_ping,
        payload.author_affliations,
        payload.post_date_gmt,
        payload.post_title,
        payload.post_browser_title,
        payload.post_browser_title_slug,
        payload.post_meta_keywords,
        payload.category_id,
        payload.journal_id,
        payload.submission_date,
        payload.publication_date,
        payload.accepted_date,
        payload.citation_volume,
        payload.citation_issue,
        payload.citation_firstpage,
        payload.citation_lastpage,
        payload.authors,
        payload.post_content,
        payload.json_format,
        payload.post_type,
        payload.deleted,
        payload.post_modified,
        recordId,
      ];

      const [result] = await pool.query(sql, values);
      return res.status(200).json({ status: true, message: 'Fulltext article updated successfully', data: result });
    }

    const sql = `INSERT INTO wp_fulltextarticles (post_content_filtered, post_modified_gmt, pinged, to_ping, author_affliations, post_date_gmt, post_title, post_browser_title, post_browser_title_slug, post_meta_keywords, category_id, journal_id, submission_date, publication_date, accepted_date, citation_volume, citation_issue, citation_firstpage, citation_lastpage, authors, post_content, json_format, post_type, deleted, post_date, post_modified) VALUES (?,?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      payload.post_content_filtered,
      payload.post_modified_gmt,
      payload.pinged,
      payload.to_ping,
      payload.author_affliations,
      payload.post_date_gmt,
      payload.post_title,
      payload.post_browser_title,
      payload.post_browser_title_slug,
      payload.post_meta_keywords,
      payload.category_id,
      payload.journal_id,
      payload.submission_date,
      payload.publication_date,
      payload.accepted_date,
      payload.citation_volume,
      payload.citation_issue,
      payload.citation_firstpage,
      payload.citation_lastpage,
      payload.authors,
      payload.post_content,
      payload.json_format,
      payload.post_type,
      payload.deleted,
      payload.post_date,
      payload.post_modified
    ];

    const [result] = await pool.query(sql, values);
    return res.status(200).json({ status: true, message: 'Fulltext article saved successfully', data: result });
  } catch (err: any) {
    return res.status(500).json({ status: false, error: err?.message || String(err) });
  }
};


export const getFulltxtArticleById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `SELECT post_browser_title_slug, publication_date, authors, citation_volume, citation_issue, citation_firstpage, citation_lastpage, ID,post_title,json_format, post_browser_title,post_meta_keywords,post_content,post_date,journal_id,category_id,submission_date, accepted_date FROM  wp_fulltextarticles WHERE id =${id} `;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ data });
    });
  } catch (err) {
    const error = new HttpError('Failed to load data', 500);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFullTextArticle = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_fulltextarticles\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Fulltext article deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete Fulltext article', 500);
    return res.status(500).json({ message: error.message });
  }
};

