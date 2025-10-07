import { Router } from "express";
import articleCategoriesController from "../controller/article/categoryController.js";
import articleMasterController from "../controller/article/articleMasterController.js";

const router = Router();

// Create a new category
router.route("/category/create").post((req, res, next) => {
  const controller = new articleCategoriesController();
  return controller.createCategory(req, res, next);
});

// Get all categories
router.route("/category/").get((req, res, next) => {
  const controller = new articleCategoriesController();
  return controller.getAllCategories(req, res, next);
});

// Get category by ID
router.route("/category/:id").get((req, res, next) => {
  const controller = new articleCategoriesController();
  return controller.getCategoryById(req, res, next);
});

// Update category by ID
router.route("/category/:id").put((req, res, next) => {
  const controller = new articleCategoriesController();
  return controller.updateCategory(req, res, next);
});

// Soft delete category by ID (set status = 0)
router.route("/category/:id").delete((req, res, next) => {
  const controller = new articleCategoriesController();
  return controller.deleteCategory(req, res, next);
});
router.post("/master/create", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.createArticle(req, res, next);
});

// Add Media (text/image/video)
router.post("/media", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.addMedia(req, res, next);
});

// Get All
router.get("/master", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.getAllArticles(req, res, next);
});

// Get by ID
router.get("/master/:id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.getArticleById(req, res, next);
});

// Update
router.put("/master/:id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.updateArticle(req, res, next);
});

// Delete
router.delete("/master/:id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.deleteArticle(req, res, next);
});
// Get all media for an article
router.get("/media/:article_id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.getMedia(req, res, next);
});

// Update media (text/image/video)
router.put("/media/:id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.updateMedia(req, res, next);
});

// Delete media by ID
router.delete("/media/:id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.deleteMedia(req, res, next);
});


// Toggle Save / Unsave Article
router.post("/master/save", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.toggleSaveArticle(req, res, next);
});

// Get All Saved Articles by User
router.get("/master/saved/:user_id", (req, res, next) => {
  const controller = new articleMasterController();
  return controller.getSavedArticles(req, res, next);
});



export default router;
