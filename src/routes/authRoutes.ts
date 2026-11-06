import express from "express";
import { register, login } from "../controllers/authController";
import { getUsers, createUser, updateUser } from "../controllers/usersController";
import { getDashboardStats, getSiteMapTrackings, getSupliTypes, getSupliTypeById, saveOrUpdateSupliType, deleteSupliType } from "../controllers/dashboardController";
import { getMainCategories, createMainCategory } from "../controllers/mainCategoryController";
import { getSubmitManuscripts, updateSubmitManuscriptStatus, deleteSubmitManuscript, getUnreadEnquiryCounts } from "../controllers/submitManuscriptController";
import { deleteContactEnquiry, updateContactEnquiryStatus } from "../controllers/contactEnquiries";
import { verifyToken } from "../middleware/authMiddleware";
import { getContactEnquiries } from "../controllers/contactEnquiries";
import { getOnlyJournals, getJournalArchives, getJournalArchivesById, getjournalandcategories, getVolumes, updateArchive, deleteArchive, saveOrUpdateArticle, getLatestArticleById, getLatestArticles, deleteLatestArticle, getJournalsFullData, getJournalById, addOrUpdateJournal, getJournalPosts, getJournalPostsById, addOrUpdateJournalPost, deleteJournalPost } from "../controllers/newJournalsController";
import { upload, uploadFiles, getUploadedFiles } from "../controllers/uploadController";
import { getFullTextArticles, saveFullTextArticle, getFulltxtArticleById, deleteFullTextArticle } from "../controllers/fulltextController";
import { getEbMembersByJournalId, getEbMemberById, updateEbMember, deleteEbMember } from "../controllers/ebMembersController";
import { addOrUpdateTestimonials, deleteTestimonial, getTestimonials, getTestimonialById } from "../controllers/testimonials";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/upload-files", upload.any(), uploadFiles);
router.get("/health", (req, res) => res.json({ ok: true }));
router.get("/testroute", (req, res) => {
  return res.json({ message: "Router file is working!" });
});


router.use(verifyToken);

router.get("/users", getUsers);
router.post("/getMainCategories", getMainCategories);
router.post("/createMainCategory", createMainCategory);
router.get("/getDashboardStats", getDashboardStats);
router.get("/getSiteMapTrackings", getSiteMapTrackings);
router.get("/getSupliTypes", getSupliTypes);
router.post("/createUser", createUser);
router.put("/updateUser/:id", updateUser);
router.get("/getSubmitManuscripts", getSubmitManuscripts);
router.get("/getUnreadEnquiryCounts", getUnreadEnquiryCounts);
router.put("/updateSubmitManuscriptStatus/:id", updateSubmitManuscriptStatus);
router.put("/updateContactEnquiryStatus/:id", updateContactEnquiryStatus);
router.post("/saveOrUpdateArticle", saveOrUpdateArticle);
router.put("/saveOrUpdateArticle/:id", saveOrUpdateArticle);

router.post("/saveOrUpdateSupliType", saveOrUpdateSupliType);
router.put("/saveOrUpdateSupliType/:id", saveOrUpdateSupliType);

router.delete("/deleteSubmitManuscript/:id", deleteSubmitManuscript);
router.delete("/deleteContactEnquiry/:id", deleteContactEnquiry);
router.get("/getContactEnquiries", getContactEnquiries);
router.get("/getOnlyJournals", getOnlyJournals);
router.post("/getJournalArchives", getJournalArchives);
router.get("/getJournalAndCategories", getjournalandcategories);
router.get("/getVolumes", getVolumes);
router.get("/getJournalArchivesById/:id", getJournalArchivesById);
router.post("/updateArchive", updateArchive);
router.get("/getFullTextArticles", getFullTextArticles);
router.post("/saveFulltextArticle", saveFullTextArticle);
router.get("/getFulltxtArticleById/:id", getFulltxtArticleById);
router.get("/getLatestArticles", getLatestArticles);
router.delete("/deleteFullTextArticle/:id", deleteFullTextArticle);
router.delete("/deleteArchive/:id", deleteArchive);
router.get("/getLatestArticleById/:id", getLatestArticleById);
router.get("/getSupliTypeById/:id", getSupliTypeById);
router.delete("/deleteLatestArticle/:id", deleteLatestArticle);
router.delete("/deleteJournalPost/:id", deleteJournalPost);
router.delete("/deleteSupliType/:id", deleteSupliType);
router.get("/getUploadedFiles", getUploadedFiles);
router.get("/getEbMembersByJournalId/:id", getEbMembersByJournalId);
router.get("/getEbMemberById/:id", getEbMemberById);
router.post("/updateEbMember/", updateEbMember);
router.delete("/deleteEbMember/:id", deleteEbMember);
router.get("/getJournalsFullData", getJournalsFullData);
router.get("/getJournalById/:id", getJournalById);
router.post("/addOrUpdateJournal", addOrUpdateJournal);
router.put("/addOrUpdateJournal/:id", addOrUpdateJournal);
router.get("/getJournalPosts", getJournalPosts)
router.get("/getJournalPostsById/:id", getJournalPostsById)
router.post("/addOrUpdateJournalPost", addOrUpdateJournalPost)
router.put("/addOrUpdateJournalPost/:id", addOrUpdateJournalPost);
router.get('/getTestimonials', getTestimonials);
router.post('/addOrUpdateTestimonials', addOrUpdateTestimonials);
router.put('/addOrUpdateTestimonials/:id', addOrUpdateTestimonials);
router.delete('/deleteTestimonial/:id', deleteTestimonial);
router.get("/getTestimonialById/:id", getTestimonialById)
// router.post("/saveOrUpdateArticle", (req: any, res: any) => {
//   res.json({ message: "The sersver can see this new route!" });
// });
export default router;