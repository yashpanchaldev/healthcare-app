import { v4 as uuidv4 } from "uuid";
import { Base } from "../../service/base.js";

export default class articleMasterController extends Base {
  constructor() {
    super();
  }

  // ✅ Create new article
  async createArticle(req, res, next) {
    try {
      const adminId = req._id;

      // ✅ 1. Check admin role
      const checkRole = await this.selectOne(
        "SELECT user_type FROM users WHERE id = ?",
        [adminId]
      );
      if (checkRole?.user_type !== "admin") {
        this.s = 0;
        this.m = "Only admin can create articles.";
        return this.send_res(res);
      }

      // ✅ 2. Get and validate body
      const { category_id, title, author, is_published } = req.body;
      if (this.varify_req(req, ["category_id", "title", "author"]))
        return this.send_res(res);

      // ✅ 3. Generate unique slug
      const slug = this.generateSlug(title) + "-" + uuidv4().slice(0, 6);

      // ✅ 4. Insert into master table
      const result = await this.insert(
        `INSERT INTO articles_master (category_id, title, slug, author, is_published) 
         VALUES (?, ?, ?, ?, ?)`,
        [category_id, title, slug, author, is_published || 0]
      );

      this.s = 1;
      this.m = "Article created successfully.";
      this.r = { article_id: result, slug };
      return this.send_res(res);

    } catch (err) {
      this.s = 0;
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Add media (text, image, video)
async addMedia(req, res, next) {
  try {
    const { article_id, type, content, sort_order } = req.body; // type: text | image | video
    if (this.varify_req(req, ["article_id", "type"])) return this.send_res(res);

    // Validate type
    const validTypes = ["text", "image", "video"];
    if (!validTypes.includes(type)) {
      this.s = 0;
      this.m = "Invalid media type. Must be 'text', 'image', or 'video'.";
      return this.send_res(res);
    }

    let mediaUrl = null;

    // Handle file uploads for image/video
    if (type === "image" || type === "video") {
      if (req.files && req.files.media) {
        mediaUrl = await this.uploadToCloudinary(req.files.media, "articles");
      } else {
        this.s = 0;
        this.m = "Media file is required for type image/video.";
        return this.send_res(res);
      }
    }

    // For text content, use provided text; for others, use uploaded URL
    const data = type === "text" ? content : mediaUrl;

    // Optional: set default sort_order if not given
    const [nextSort] = await this.select(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextSort FROM article_media WHERE article_id = ?`,
      [article_id]
    );
    const finalSortOrder = sort_order || nextSort.nextSort || 1;

    await this.insert(
      `INSERT INTO article_media (article_id, type, content, sort_order, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [article_id, type, data, finalSortOrder]
    );

    this.s = 1;
    this.m = "Media added successfully.";
    return this.send_res(res);

  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}
async getMedia(req, res, next) {
  try {
    const { article_id } = req.params;

    const media = await this.select(
      `SELECT id, article_id, type, content, sort_order, created_at 
       FROM article_media 
       WHERE article_id = ? 
       ORDER BY sort_order ASC, created_at ASC`,
      [article_id]
    );

    this.s = 1;
    this.m = "Media fetched successfully.";
    this.r = media;
    return this.send_res(res);
  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}
async updateMedia(req, res, next) {
  try {
    const { id } = req.params;
    const { type, content, sort_order } = req.body;

    // Validate record existence
    const [existing] = await this.select(
      `SELECT * FROM article_media WHERE id = ?`,
      [id]
    );
    if (!existing) {
      this.s = 0;
      this.m = "Media not found.";
      return this.send_res(res);
    }

    let newContent = content;

    // If type is image or video, handle Cloudinary upload
    if ((type === "image" || type === "video") && req.files && req.files.media) {
      newContent = await this.uploadToCloudinary(req.files.media, "articles");
    }

    await this.update(
      `UPDATE article_media 
       SET type = ?, content = ?, sort_order = ?, updated_at = NOW() 
       WHERE id = ?`,
      [type || existing.type, newContent || existing.content, sort_order || existing.sort_order, id]
    );

    this.s = 1;
    this.m = "Media updated successfully.";
    return this.send_res(res);
  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}
async deleteMedia(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await this.select(
      `SELECT * FROM article_media WHERE id = ?`,
      [id]
    );
    if (!existing) {
      this.s = 0;
      this.m = "Media not found.";
      return this.send_res(res);
    }

    await this.execute(`DELETE FROM article_media WHERE id = ?`, [id]);

    this.s = 1;
    this.m = "Media deleted successfully.";
    return this.send_res(res);
  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}

  // ✅ Get all articles (with category name)
  async getAllArticles(req, res, next) {
    try {
      const data = await this.select(
        `SELECT a.*, c.name AS category_name 
         FROM articles_master a
         LEFT JOIN articles_categories c ON a.category_id = c.id
         WHERE a.is_published = 1`
      );

      this.s = 1;
      this.r = data;
      this.m = "Articles fetched successfully.";
      return this.send_res(res);

    } catch (err) {
      this.s = 0;
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Get single article (with media)
  async getArticleById(req, res, next) {
    try {
      const { id } = req.params;

      const article = await this.selectOne(
        `SELECT * FROM articles_master WHERE id = ? AND is_published = 1`,
        [id]
      );

      if (!article) {
        this.s = 0;
        this.m = "Article not found.";
        return this.send_res(res);
      }

      const media = await this.select(
        `SELECT id, type, content FROM article_media WHERE article_id = ? ORDER BY id ASC`,
        [id]
      );

      this.s = 1;
      this.m = "Article fetched successfully.";
      this.r = { ...article, media };
      return this.send_res(res);

    } catch (err) {
      this.s = 0;
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Update article
  async updateArticle(req, res, next) {
    try {
      const adminId = req._id;

      // ✅ 1. Check admin role
      const checkRole = await this.selectOne(
        "SELECT user_type FROM users WHERE id = ?",
        [adminId]
      );
      if (checkRole?.user_type !== "admin") {
        this.s = 0;
        this.m = "Only admin can update articles.";
        return this.send_res(res);
      }

      const { id } = req.params;
      const { title, category_id, author, is_published } = req.body;

      await this.update(
        `UPDATE articles_master 
         SET title = ?, category_id = ?, author = ?, is_published = ?, updated_at = NOW()
         WHERE id = ?`,
        [title, category_id, author, is_published, id]
      );

      this.s = 1;
      this.m = "Article updated successfully.";
      return this.send_res(res);

    } catch (err) {
      this.s = 0;
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Soft delete article
  async deleteArticle(req, res, next) {
    try {
      const adminId = req._id;

      // ✅ 1. Check admin role
      const checkRole = await this.selectOne(
        "SELECT user_type FROM users WHERE id = ?",
        [adminId]
      );
      if (checkRole?.user_type !== "admin") {
        this.s = 0;
        this.m = "Only admin can delete articles.";
        return this.send_res(res);
      }

      const { id } = req.params;

      await this.update(
        `UPDATE articles_master SET status = 0, updated_at = NOW() WHERE id = ?`,
        [id]
      );

      this.s = 1;
      this.m = "Article deleted successfully.";
      return this.send_res(res);

    } catch (err) {
      this.s = 0;
      this.err = err.message;
      return this.send_res(res);
    }
  }

async toggleSaveArticle(req, res, next) {
  try {
    const { article_id } = req.body;
    const user_id = req._id || req.body.user_id; // based on your auth

    if (!article_id || !user_id) {
      this.s = 0;
      this.m = "article_id and user_id are required.";
      return this.send_res(res);
    }

    // Check existing record
    const [existing] = await this.select(
      `SELECT id, status FROM article_saved WHERE user_id = ? AND article_id = ?`,
      [user_id, article_id]
    );

    if (existing) {
      // If exists → toggle status
      const newStatus = existing.status === 1 ? 0 : 1;

      await this.update(
        `UPDATE article_saved 
         SET status = ?, updated_at = NOW() 
         WHERE id = ?`,
        [newStatus, existing.id]
      );

      this.s = 1;
      this.m = newStatus === 1 ? "Article saved successfully." : "Article unsaved successfully.";
      this.d = { saved: newStatus === 1 };
    } else {
      // If not exists → create new record with status = 1
      await this.insert(
        `INSERT INTO article_saved (user_id, article_id, status, created_at) VALUES (?, ?, 1, NOW())`,
        [user_id, article_id]
      );

      this.s = 1;
      this.m = "Article saved successfully.";
      this.d = { saved: true };
    }

    return this.send_res(res);
  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}

async getSavedArticles(req, res, next) {
  try {
    const user_id = req._id || req.params.user_id;

    if (!user_id) {
      this.s = 0;
      this.m = "user_id is required.";
      return this.send_res(res);
    }
    const savedArticles = await this.select(
      `SELECT a.article_id, am.title ,am.created_at
       FROM article_saved a
       JOIN articles_master am ON a.article_id = am.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [user_id]
    );

    this.s = 1;
    this.m = "Saved articles fetched successfully.";
    this.r = savedArticles;
    return this.send_res(res);
  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}


}
