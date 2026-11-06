import { Request, Response } from 'express';
import { db } from '../config/db';
const HttpError = require('../models/http-error');

export const getOnlyJournals = (req: Request, res: Response) => {
  try {
    const query = `SELECT wp_journals.journal_name,wp_journals.id, wp_journal_main_categories.category_id, wp_journal_main_categories.category_name FROM wp_journals LEFT JOIN wp_journal_main_categories ON wp_journals.main_category_id=wp_journal_main_categories.category_id GROUP BY wp_journals.journal_name`;
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

export const getJournalArchives = (req: Request, res: Response) => {
  try {
    const { archive_in, journal_id } = req.body;
    const query = `SELECT a.id, a.article_title, a.archive_doi,a.archive_year,a.archive_volume, a.archive_fulltext,a.archive_pdf,a.archive_in, a.created_date,a.archive_desc, b.journal_name, c.category_name FROM wp_journal_archives a INNER JOIN wp_journals b ON a.journal_id = b.id LEFT JOIN wp_journal_main_categories c ON b.main_category_id = c.category_id WHERE a.archive_in = "${archive_in}" AND a.journal_id = "${journal_id}" AND a.deleted = 1`;
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

export const getJournalArchivesById = (req: Request, res: Response) => {
  try {
    // 1. FIX: Changed req.body to req.params to match /:id
    const { id } = req.params; 

    // 2. FIX: Replaced direct string interpolation with a safe "?" placeholder
    const query = `SELECT * FROM wp_journal_archives WHERE id = ? AND deleted = 1`;
    
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

export const getLatestArticleById = (req: Request, res: Response) => {
  try {
    // 1. FIX: Changed req.body to req.params to match /:id
    const { id } = req.params; 

    // 2. FIX: Replaced direct string interpolation with a safe "?" placeholder
    const query = `SELECT * FROM wp_latest_articles WHERE id = ? AND deleted = 1`;
    
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

export const getJournalById = (req: Request, res: Response) => {
  try {
    // 1. FIX: Changed req.body to req.params to match /:id
    const { id } = req.params; 

    // 2. FIX: Replaced direct string interpolation with a safe "?" placeholder
    const query = `SELECT * FROM wp_journals WHERE id = ? AND deleted = 1`;
    
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

export const getjournalandcategories = (req: Request, res: Response) => {
  try {
    const query = `SELECT wp_journals.journal_name,wp_journals.id, wp_journal_main_categories.category_id, wp_journal_main_categories.category_name FROM wp_journals LEFT JOIN wp_journal_main_categories ON wp_journals.main_category_id=wp_journal_main_categories.category_id GROUP BY wp_journals.journal_name`;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      return res.status(200).json({ data: result });
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    return res.status(500).json({ message: error.message });
  }
};

export const getVolumes = (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM wp_journal_volumes`;
    db.query(query, async (err, data: any) => {
      if (err) return res.status(500).json(err);
      const result = data;
      return res.status(200).json({ data: result });
    })
  } catch(err) {
    const error = new HttpError('Failed to load data', 500)
    return res.status(500).json({ message: error.message });
  }
};

export const updateArchive = (req: Request, res: Response) => {
  try {
    const data = req.body || {};

    const archive_pdf = data.archive_pdf || '';
    const supli_pdf = data.supli_pdf || '';
    const archive_fulltext = data.archive_fulltext || '';
    const archive_desc = data.archive_desc || '';
    const article_title = data.article_title || '';

    if (data.id) {
      const sql = `UPDATE wp_journal_archives SET article_pub_date = ?, journal_id = ?, category_id = ?, archive_desc = ?, archive_doi = ?, archive_year = ?, archive_volume = ?, archive_fulltext = ?, archive_pdf = ?, journal_slug = ?, archive_in = ?, supli_pdf = ?, article_title = ?, article_link = ?, article_authors = ?, doi_name = ?, doi_link = ? WHERE id = ?`;
      const values = [
        data.article_pub_date,
        data.journal_id,
        data.category_id,
        archive_desc,
        data.archive_doi,
        data.archive_year,
        data.archive_volume,
        archive_fulltext,
        archive_pdf,
        data.journal_slug,
        data.archive_in,
        supli_pdf,
        article_title,
        data.article_link,
        data.article_authors,
        data.doi_name,
        data.doi_link,
        data.id,
      ];

      db.query(sql, values, (err: any, result: any) => {
        if (err) return res.status(500).json({ status: false, error: err });
        return res.json({ status: true, message: 'Journal Archive Edited Successfully' });
      });
    } else {
      const sql = `INSERT INTO wp_journal_archives (article_pub_date, article_title, article_link, article_authors, doi_name, doi_link, journal_id, category_id, archive_desc, archive_doi, archive_year, archive_volume, archive_fulltext, archive_pdf, supli_pdf, archive_in, journal_slug, created_date, updated_date, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
      const today = new Date().toISOString().slice(0, 10);
      const values = [
        data.article_pub_date,
        article_title,
        data.article_link,
        data.article_authors,
        data.doi_name,
        data.doi_link,
        data.journal_id,
        data.category_id,
        archive_desc,
        data.archive_doi,
        data.archive_year,
        data.archive_volume,
        archive_fulltext,
        archive_pdf,
        supli_pdf,
        data.archive_in,
        data.journal_slug,
        today,
        today,
      ];

      db.query(sql, values, (err: any, result: any) => {
        if (err) return res.status(500).json({ status: false, error: err });
        return res.json({ status: true, message: 'Journal Archive Added Successfully' });
      });
    }
  } catch (err: any) {
    return res.status(500).json({ status: false, error: err?.message || String(err) });
  }
};

export const deleteArchive = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_journal_archives\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Archive deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete Archive', 500);
    return res.status(500).json({ message: error.message });
  }
};

export const saveOrUpdateArticle = (req: Request, res: Response) => {
  try {
    // 1. Grab ID from params (for updates) or body (for new records if provided)
    const id = req.params.id || req.body.id || null;
    const { article_name, pdf_link, article_category, article_image, author_name } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    
    // 2. Validate essential text fields
    if (!article_name || !pdf_link) {
      return res.status(400).json({ message: 'Invalid request. Missing article_name or pdf_link.' });
    }

    // 3. MySQL Upsert Query (Inserts new row, or updates existing row on ID conflict)
    const query = `
      INSERT INTO wp_latest_articles 
        (id, article_name, pdf_link, article_category, article_image, author_name, updated_date, created_date, deleted) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '1')
      ON DUPLICATE KEY UPDATE 
        article_name = VALUES(article_name),
        pdf_link = VALUES(pdf_link),
        article_category = VALUES(article_category),
        article_image = VALUES(article_image),
        author_name = VALUES(author_name),
        updated_date = VALUES(updated_date),
        deleted = '1'
    `;

    // 4. Match the query parameters array
    const values = [
      id, // If null, MySQL auto-increments a new ID
      article_name,
      pdf_link,
      article_category || null,
      article_image || null,
      author_name || null,
      today, // updated_date
      today  // created_date (ignored if updating)
    ];

    // 5. Execute parameterized query
    db.query(query, values, (err: any, result: any) => {
      if (err) {
        return res.status(500).json({ message: 'Database operation failed', error: err });
      }
      
      // Determine if it was an insert or update based on MySQL affectedRows
      const isUpdate = result.affectedRows === 2; 
      return res.status(200).json({ 
        message: isUpdate ? 'Article updated successfully' : 'Article added successfully', 
        data: result 
      });
    });

  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to process request' });
  }
};

export const getLatestArticles = (req: Request, res: Response) => {
  // Query to get the newest articles (adjust the LIMIT as needed)
  const query = `SELECT wp_latest_articles.id,wp_latest_articles.article_image,wp_latest_articles.article_name,wp_latest_articles.created_date,wp_latest_articles.author_name,wp_latest_articles.pdf_link,wp_journals.journal_name FROM wp_latest_articles INNER JOIN wp_journals ON wp_journals.id = wp_latest_articles.article_category WHERE wp_latest_articles.deleted = "1" ORDER BY wp_latest_articles.created_date DESC`;

  db.query(query, (err, data: any) => {
    if (err) {
      console.error("Database Error:", err); // Log it so you can see it in terminal
      return res.status(500).json({ message: "Database query failed", error: err.message });
    }
    
    // Wrap it exactly how your React app expects it: response.data.data and response.data.totalCount
    return res.status(200).json({ 
      data: data, 
      totalCount: data.length 
    });
  });
};

export const deleteLatestArticle = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_latest_articles\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Latest article deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete Latest article', 500);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteJournalPost = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `UPDATE \`wp_journal_posts\` SET deleted = 2 WHERE id = ?`;
    db.query(query, [id], (err: any, data: any) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Journal post deleted successfully" });
    });
  } catch (err) {
    const error = new HttpError('Failed to delete Journal post', 500);
    return res.status(500).json({ message: error.message });
  }
};


export const getJournalsFullData = (req: Request, res: Response) => {
  
  // Query to get the newest articles (adjust the LIMIT as needed)
  const query = `SELECT * FROM wp_journals WHERE deleted ="1"`;

  db.query(query, (err, data: any) => {
    if (err) {
      console.error("Database Error:", err); // Log it so you can see it in terminal
      return res.status(500).json({ message: "Database query failed", error: err.message });
    }
    
    // Wrap it exactly how your React app expects it: response.data.data and response.data.totalCount
    return res.status(200).json({ 
      data: data, 
      totalCount: data.length 
    });
  });
};

export const addOrUpdateJournal = (req: Request, res: Response) => {
  try {
    // ID can come from URL params or request body
    const id = req.params.id || req.body.id || null;

    const {
      journal_url_slug,
      journal_name,
      issn_number,
      impact_factor,
      impact_factor_equation,
      journal_meta_keywords,
      journal_ic_value,
      main_category_id,
      journal_description,
      banner_image,
      sidebar_image,
    } = req.body;

    const today = new Date().toISOString().slice(0, 10);

    // Validate required fields
    if (
      !journal_url_slug ||
      !journal_name ||
      !issn_number ||
      !impact_factor ||
      !impact_factor_equation ||
      !banner_image ||
      !sidebar_image
    ) {
      return res.status(400).json({
        message: 'Invalid request. Required journal fields are missing.',
      });
    }

    /*
     * Insert new journal or update existing journal
     *
     * Change `wp_journals` if your actual table name is different.
     */
    const query = `
      INSERT INTO wp_journals
        (
          id,
          journal_url_slug,
          journal_name,
          issn_number,
          impact_factor,
          impact_factor_equation,
          journal_meta_keywords,
          journal_ic_value,
          main_category_id,
          journal_description,
          banner_image,
          sidebar_image,
          updated_date,
          created_date,
          deleted
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0')

      ON DUPLICATE KEY UPDATE
        journal_url_slug = VALUES(journal_url_slug),
        journal_name = VALUES(journal_name),
        issn_number = VALUES(issn_number),
        impact_factor = VALUES(impact_factor),
        impact_factor_equation = VALUES(impact_factor_equation),
        journal_meta_keywords = VALUES(journal_meta_keywords),
        journal_ic_value = VALUES(journal_ic_value),
        main_category_id = VALUES(main_category_id),
        journal_description = VALUES(journal_description),
        banner_image = VALUES(banner_image),
        sidebar_image = VALUES(sidebar_image),
        updated_date = VALUES(updated_date),
        deleted = '0'
    `;

    const values = [
      id,
      journal_url_slug,
      journal_name,
      issn_number,
      impact_factor,
      impact_factor_equation,
      journal_meta_keywords,
      journal_ic_value,
      main_category_id,
      journal_description,
      banner_image,
      sidebar_image,
      today, // updated_date
      today, // created_date
    ];

    db.query(query, values, (err: any, result: any) => {
      if (err) {
        console.error('Journal database error:', err);

        return res.status(500).json({
          message: 'Database operation failed',
          error: err,
        });
      }

      /*
       * MySQL:
       * affectedRows = 1 -> INSERT
       * affectedRows = 2 -> UPDATE
       */
      const isUpdate = result.affectedRows === 2;

      return res.status(200).json({
        message: isUpdate
          ? 'Journal updated successfully'
          : 'Journal added successfully',
        data: result,
      });
    });
  } catch (err: any) {
    console.error('Journal controller error:', err);

    return res.status(500).json({
      message:
        err?.message || 'Failed to process journal request',
    });
  }
};


export const getJournalPosts = (req: Request, res: Response) => {
  // Query to get the newest articles (adjust the LIMIT as needed)
  const query = `SELECT jp.id, jp.post_name, j.journal_name, mc.category_name,jp.created_date, jp.updated_date FROM wp_journal_posts jp INNER JOIN wp_journals j on jp.journal_id = j.id LEFT JOIN wp_journal_main_categories mc on mc.category_id = j.main_category_id WHERE jp.deleted="1"`;

  db.query(query, (err, data: any) => {
    if (err) {
      console.error("Database Error:", err); // Log it so you can see it in terminal
      return res.status(500).json({ message: "Database query failed", error: err.message });
    }
    
    // Wrap it exactly how your React app expects it: response.data.data and response.data.totalCount
    return res.status(200).json({ 
      data: data, 
      totalCount: data.length 
    });
  });
};

export const getJournalPostsById = (req: Request, res: Response) => {
  const { id } = req.params;
  const query = `SELECT * FROM wp_journal_posts WHERE id = ? AND deleted = 1`;
  db.query(query, [id], (err, data: any) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Database query failed", error: err.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: "Journal post not found" });
    }

    return res.status(200).json({ data: data[0] });
  });
};


export const addOrUpdateJournalPost = (req: Request, res: Response) => {
  try {
    const id = req.params.id || req.body.id || null;

    const {
      category_id,
      journal_id,
      post_content,
      post_keywords,
      post_meta_description,
      post_name,
      post_slug,
      post_title_tag,
    } = req.body;

    const today = new Date().toISOString().slice(0, 10);

    // Validate required fields
    if (
      !category_id ||
      !journal_id ||
      !post_content ||
      !post_keywords ||
      !post_meta_description ||
      !post_name ||
      !post_slug ||
      !post_title_tag
    ) {
      return res.status(400).json({
        message: 'Invalid request. Required journal fields are missing.',
      });
    }

    // ==========================================
    // UPDATE - ID PROVIDED
    // ==========================================
    if (id) {
      const updateQuery = `
        UPDATE wp_journal_posts
        SET
          category_id = ?,
          journal_id = ?,
          post_name = ?,
          post_content = ?,
          post_keywords = ?,
          post_meta_description = ?,
          post_slug = ?,
          post_title_tag = ?,
          updated_date = ?
          WHERE id = ?
      `;

      const updateValues = [
        category_id,
        journal_id,
        post_name,
        post_content,
        post_keywords,
        post_meta_description,
        post_slug,
        post_title_tag,
        today,
        id,
      ];

      db.query(
        updateQuery,
        updateValues,
        (err: any, result: any) => {
          if (err) {
            console.error('Journal update database error:', err);
            return res.status(500).json({
              message: 'Database update failed',
              error: err.message,
            });
          }

          // ID provided but record does not exist
          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: `Journal post with id ${id} not found`,
            });
          }

          return res.status(200).json({
            message: 'Journal post updated successfully',
            data: result,
          });
        }
      );

      return;
    }

    // ==========================================
    // INSERT - NO ID PROVIDED
    // ==========================================
    const insertQuery = `
      INSERT INTO wp_journal_posts (
        category_id,
        journal_id,
        post_name,
        post_content,
        post_keywords,
        post_meta_description,
        post_slug,
        post_title_tag,
        updated_date,
        created_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      category_id,
      journal_id,
      post_name,
      post_content,
      post_keywords,
      post_meta_description,
      post_slug,
      post_title_tag,
      today,
      today,
    ];

    db.query(
      insertQuery,
      insertValues,
      (err: any, result: any) => {
        if (err) {
          console.error('Journal insert database error:', err);

          return res.status(500).json({
            message: 'Database insert failed',
            error: err.message,
          });
        }

        return res.status(201).json({
          message: 'Journal post added successfully',
          data: result,
        });
      }
    );
  } catch (err: any) {
    console.error('Journal post controller error:', err);

    return res.status(500).json({
      message: err?.message || 'Failed to process journal post request',
    });
  }
};
