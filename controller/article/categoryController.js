import { Base } from "../../service/base.js";

export default class categoriesController extends Base {
  constructor() {
    super();
  }

  // ✅ Helper: Generate slug from name
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  // ✅ Admin check
  async checkAdmin(req) {
    const userId = req._id;
    const user = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [userId]
    );
    return user?.user_type === "admin";
  }

  // ✅ Create category
  async createCategory(req, res, next) {
    try {
      if (!(await this.checkAdmin(req))) {
        this.s = 0;
        this.m = "Only admin can manage article categories.";
        return this.send_res(res);
      }

      const { name, description } = req.body;

      if (this.varify_req(req, ["name"])) return this.send_res(res);

      const existing = await this.selectOne(
        "SELECT * FROM articles_categories WHERE name = ? AND status = 1",
        [name]
      );

      if (existing) {
        this.s = 0;
        this.m = "Category already exists.";
        return this.send_res(res);
      }

      const slug = this.generateSlug(name);

      await this.insert(
        "INSERT INTO articles_categories (name, description, slug) VALUES (?, ?, ?)",
        [name, description, slug]
      );

      this.s = 1;
      this.m = "Category created successfully.";
      return this.send_res(res);
    } catch (err) {
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Get all categories (excluding deleted)
  async getAllCategories(req, res, next) {
    try {
      if (!(await this.checkAdmin(req))) {
        this.s = 0;
        this.m = "Only admin can manage article categories.";
        return this.send_res(res);
      }

      const data = await this.select(
        "SELECT * FROM articles_categories WHERE status = 1"
      );

      this.s = 1;
      this.m = "Categories fetched successfully.";
      this.r = data;
      return this.send_res(res);
    } catch (err) {
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Get category by ID
  async getCategoryById(req, res, next) {
    try {
      if (!(await this.checkAdmin(req))) {
        this.s = 0;
        this.m = "Only admin can manage article categories.";
        return this.send_res(res);
      }

      const { id } = req.params;

      const data = await this.selectOne(
        "SELECT * FROM articles_categories WHERE id = ? AND status = 1",
        [id]
      );

      if (!data) {
        this.s = 0;
        this.m = "Category not found.";
        return this.send_res(res);
      }

      this.s = 1;
      this.m = "Category fetched successfully.";
      this.r = data;
      return this.send_res(res);
    } catch (err) {
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Update category
  async updateCategory(req, res, next) {
    try {
      if (!(await this.checkAdmin(req))) {
        this.s = 0;
        this.m = "Only admin can manage article categories.";
        return this.send_res(res);
      }

      const { id } = req.params;
      const { name, description } = req.body;

      if (this.varify_req(req, ["name"])) return this.send_res(res);

      const category = await this.selectOne(
        "SELECT * FROM articles_categories WHERE id = ? AND status = 1",
        [id]
      );

      if (!category) {
        this.s = 0;
        this.m = "Category not found.";
        return this.send_res(res);
      }

      const slug = this.generateSlug(name);

      await this.update(
        "UPDATE articles_categories SET name = ?, description = ?, slug = ? WHERE id = ?",
        [name, description, slug, id]
      );

      this.s = 1;
      this.m = "Category updated successfully.";
      return this.send_res(res);
    } catch (err) {
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // ✅ Delete category (soft delete)
  async deleteCategory(req, res, next) {
    try {
      if (!(await this.checkAdmin(req))) {
        this.s = 0;
        this.m = "Only admin can manage article categories.";
        return this.send_res(res);
      }

      const { id } = req.params;

      const category = await this.selectOne(
        "SELECT * FROM articles_categories WHERE id = ? AND status = 1",
        [id]
      );

      if (!category) {
        this.s = 0;
        this.m = "Category not found.";
        return this.send_res(res);
      }

      await this.update(
        "UPDATE articles_categories SET status = 0 WHERE id = ?",
        [id]
      );

      this.s = 1;
      this.m = "Category deleted successfully.";
      return this.send_res(res);
    } catch (err) {
      this.err = err.message;
      return this.send_res(res);
    }
  }


 
}
