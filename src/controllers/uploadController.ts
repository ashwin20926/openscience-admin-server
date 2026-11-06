import fs from "fs";
import path from "path";
import multer from "multer";
import { Request, Response } from "express";
import { db } from "../config/db";
import sizeOf from "image-size";

// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const DEFAULT_UPLOAD_DIR = String.raw`D:\wamp64\www\avens-prod\wp-content\uploads1`;

const FULLTEXT_UPLOAD_DIR = String.raw`D:\wamp64\www\avens-prod\fulltextarticles\wp-content\uploads`;

// const DEFAULT_UPLOAD_DIR = String.raw`/home/avensnvx/public_html/public/wp-content/uploads`;
// const FULLTEXT_UPLOAD_DIR = String.raw`/home/avensnvx/public_html/fulltextarticles/wp-content/uploads`;

// ============================================================
// CREATE DIRECTORIES
// ============================================================

const ensureDirectoryExists = (directory: string) => {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }
  } catch (error) {
    console.error("Failed to create directory:", directory, error);
    throw error;
  }
};

// Create base directories
ensureDirectoryExists(DEFAULT_UPLOAD_DIR);
ensureDirectoryExists(FULLTEXT_UPLOAD_DIR);

// ============================================================
// GET UPLOAD DIRECTORY
// ============================================================
//
// Normal:
// D:\wamp64\www\avens-prod\wp-content\uploads1
//
// Fulltext:
// D:\wamp64\www\avens-prod\fulltextarticles\wp-content\uploads\2026\08
//
// ============================================================

const getUploadDirectory = (targetLocation: string): string => {
  if (targetLocation === "fulltext-wp-content") {
    const now = new Date();

    // Current year
    const currentYear = String(now.getFullYear());

    // Current month: 01 - 12
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    // Fulltext directory:
    // uploads/year/month
    const fulltextDirectory = path.join(
      FULLTEXT_UPLOAD_DIR,
      currentYear,
      currentMonth,
    );

    // Make sure year/month directories exist
    ensureDirectoryExists(fulltextDirectory);

    return fulltextDirectory;
  }

  return DEFAULT_UPLOAD_DIR;
};

// ============================================================
// GET PUBLIC URL PATH
// ============================================================
//
// Normal:
// /wp-content/uploads1
//
// Fulltext:
// /fulltextarticles/wp-content/uploads/2026/08
//
// ============================================================

const getPublicUploadPath = (targetLocation: string): string => {
  if (targetLocation === "fulltext-wp-content") {
    const now = new Date();

    const currentYear = String(now.getFullYear());

    // Current month: 01 - 12
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    return `/fulltextarticles/wp-content/uploads/${currentYear}/${currentMonth}`;
  }

  return "/wp-content/uploads";
};

// ============================================================
// ALLOWED MIME TYPES
// ============================================================

const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
];

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only PNG, JPEG, JPG, GIF and PDF files are allowed."));
};

// ============================================================
// MULTER
// ============================================================
//
// We use memoryStorage instead of diskStorage.
//
// targetLocation comes from multipart/form-data, so the
// controller decides the destination after Multer has parsed
// the request and file.
// ============================================================

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

// ============================================================
// SAFE FILE NAME
// ============================================================

const getSafeFileName = (originalName: string): string => {
  return originalName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.-]/g, "");
};

// ============================================================
// GET IMAGE DIMENSIONS
// ============================================================

const getImageDimensions = (filePath: string, mimeType: string) => {
  // ----------------------------------------------------------
  // PDF
  // ----------------------------------------------------------

  if (mimeType === "application/pdf") {
    return {
      width: 0,
      height: 0,
      imageType: "pdf",
    };
  }

  // ----------------------------------------------------------
  // IMAGE
  // ----------------------------------------------------------

  try {
    if (!fs.existsSync(filePath)) {
      return {
        width: 0,
        height: 0,
        imageType: "unknown",
      };
    }

    // Read image into Buffer
    const imageBuffer = fs.readFileSync(filePath);

    // image-size expects Uint8Array / Buffer
    const dimensions = sizeOf(imageBuffer);

    return {
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      imageType: dimensions.type || "unknown",
    };
  } catch (error) {
    console.error("Unable to read image dimensions:", error);

    return {
      width: 0,
      height: 0,
      imageType: "unknown",
    };
  }
};

// ============================================================
// SAVE FILE TO DATABASE
// ============================================================

const saveUploadedToDb = async (fileData: Record<string, any>) => {
  const originalName = fileData.original_name;

  // ----------------------------------------------------------
  // Client name
  // ----------------------------------------------------------

  const clientName = path.basename(
    originalName,
    path.extname(originalName),
  );

  // ----------------------------------------------------------
  // File extension
  // ----------------------------------------------------------

  const fileExt = path.extname(fileData.file_name);

  // ----------------------------------------------------------
  // Physical file URL
  // ----------------------------------------------------------

  const filePath = fileData?.url;

  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO wp_uploaded_files
      (
        client_name,
        file_ext,
        file_name,
        file_path,
        file_size,
        file_type,
        full_path,
        height,
        image_type,
        width,
        orig_name,
        raw_name,
        created_date,
        updated_date,
        deleted
      )
      VALUES
      (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        NOW(),
        ?,
        1
      )
    `;
    const currentYear = new Date().getFullYear();
    
    const values = [
      clientName,
      fileExt,
      fileData.file_name,
      fileData.full_path,
      fileData.size,
      fileData.mime_type,
      filePath,

      // NEVER NULL
      fileData.height || 0,

      // NEVER NULL
      fileData.image_type || "unknown",

      // NEVER NULL
      fileData.width || 0,

      fileData.original_name,
      clientName,
      currentYear
    ];

    db.query(query, values, (err: any, result: any) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
};

// ============================================================
// UPLOAD FILES
// ============================================================

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    // ========================================================
    // TARGET LOCATION
    // ========================================================

    const targetLocation =
      typeof req.body?.targetLocation === "string"
        ? req.body.targetLocation
        : "wp-content";

    // ========================================================
    // GET UPLOAD DIRECTORY
    // ========================================================

    //
    // If targetLocation is:
    //
    // fulltext-wp-content
    //
    // the directory will be:
    //
    // uploads/2026/08
    //
    // Otherwise:
    //
    // uploads1
    //
    const uploadDirectory = getUploadDirectory(targetLocation);

    // ========================================================
    // GET PUBLIC URL PATH
    // ========================================================

    const publicUploadPath = getPublicUploadPath(targetLocation);

    // ========================================================
    // ENSURE DIRECTORY EXISTS
    // ========================================================

    ensureDirectoryExists(uploadDirectory);

    // ========================================================
    // GET FILES
    // ========================================================

    let files: Express.Multer.File[] = [];

    // --------------------------------------------------------
    // Multiple files
    // --------------------------------------------------------

    if (req.files && Array.isArray(req.files)) {
      files = req.files;
    }

    // --------------------------------------------------------
    // Single file
    // --------------------------------------------------------

    if (req.file) {
      files = [req.file];
    }

    // ========================================================
    // NO FILES
    // ========================================================

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    // ========================================================
    // UPLOAD RESULTS
    // ========================================================

    const uploadResults: any[] = [];

    // ========================================================
    // PROCESS EACH FILE
    // ========================================================

    for (const file of files) {
      // ------------------------------------------------------
      // SAFE NAME
      // ------------------------------------------------------

      const safeName = getSafeFileName(file.originalname);

      // ------------------------------------------------------
      // FULL PHYSICAL PATH
      // ------------------------------------------------------

      const fullPath = path.join(
        uploadDirectory,
        safeName,
      );

      // ------------------------------------------------------
      // WRITE FILE
      // ------------------------------------------------------

      await fs.promises.writeFile(
        fullPath,
        file.buffer,
      );

      // ------------------------------------------------------
      // VERIFY FILE
      // ------------------------------------------------------

      const fileExists = fs.existsSync(fullPath);

      if (!fileExists) {
        throw new Error(
          `File was not saved: ${fullPath}`,
        );
      }

      // ------------------------------------------------------
      // IMAGE DIMENSIONS
      // ------------------------------------------------------

      const dimensions = getImageDimensions(
        fullPath,
        file.mimetype,
      );

      // ------------------------------------------------------
      // BUILD RESULT
      // ------------------------------------------------------

      const uploadData = {
        original_name: file.originalname,

        file_name: safeName,

        mime_type: file.mimetype,

        size: file.size,

        // Physical path
        full_path: fullPath,

        // Directory
        upload_directory: uploadDirectory,

        // Target
        target_location: targetLocation,

        // Image information
        width: dimensions.width,

        height: dimensions.height,

        image_type: dimensions.imageType,

        // Browser URL
        // url: `${req.protocol}://${req.get(
        //   "host",
        // )}${publicUploadPath}/${encodeURIComponent(
        //   safeName,
        // )}`,
        
        url: `https://www.avensonline.org${publicUploadPath}/${encodeURIComponent(
          safeName,
        )}`,
      };

      // ------------------------------------------------------
      // SAVE DATABASE
      // ------------------------------------------------------

      await saveUploadedToDb(uploadData);

      // ------------------------------------------------------
      // ADD RESULT
      // ------------------------------------------------------

      uploadResults.push(uploadData);
    }

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        files.length === 1
          ? "File uploaded successfully"
          : "Files uploaded successfully",

      targetLocation,

      uploadDirectory,

      file_data:
        uploadResults.length === 1
          ? {
              upload_data: uploadResults[0],
            }
          : uploadResults,

      count: uploadResults.length,
    });
  } catch (error: any) {
    console.error("File upload failed:", error);

    return res.status(500).json({
      success: false,

      error:
        error?.message ||
        "File upload failed",
    });
  }
};

// ============================================================
// GET UPLOADED FILES
// ============================================================

export const getUploadedFiles = (
  _req: Request,
  res: Response,
) => {
  const query = `
    SELECT *
    FROM wp_uploaded_files
    WHERE deleted = 1
    ORDER BY created_date DESC
  `;

  db.query(query, (err, data: any) => {
    if (err) {
      return res.status(500).json({
        message: "Database query failed",
        error: err.message,
      });
    }

    return res.status(200).json({
      data: data || [],
      totalCount: data?.length || 0,
    });
  });
};
