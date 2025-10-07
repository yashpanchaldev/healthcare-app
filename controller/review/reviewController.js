import { Base } from "../../service/base.js";

export default class reviewController extends Base {
  constructor() {
    super();
  }

  // Add a review
  async addReview(req, res, next) {
    try {
      const user_id = req._id; // logged in user
      const { doctor_id, rating, review_text } = req.body;

      if (this.varify_req(req, ["doctor_id", "rating"])) {
        return this.send_res(res);
      }

      // Insert review
      await this.insert(
        `INSERT INTO reviews (doctor_id, user_id, rating, review_text) VALUES (?,?,?,?)`,
        [doctor_id, user_id, rating, review_text]
      );
 
      this.s = 1;
      this.m = "Review added successfully";
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }

  // Update review
  async updateReview(req, res, next) {
    try {
      const { id } = req.params; // review_id
      const user_id = req._id;
      const { rating, review_text } = req.body;

      // Check if review exists and belongs to user
      const exist = await this.selectOne(
        "SELECT * FROM reviews WHERE review_id = ? AND user_id = ?",
        [id, user_id]
      );
      if (!exist) {
        this.s = 0;
        this.m = "Review not found or not authorized";
        return this.send_res(res);
      }

      await this.update(
        `UPDATE reviews SET rating = ?, review_text = ? WHERE review_id = ? AND user_id = ?`,
        [rating, review_text, id, user_id]
      );

      this.s = 1;
      this.m = "Review updated successfully";
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }

  // Delete review
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params; // review_id
      const user_id = req._id;

      const exist = await this.selectOne(
        "SELECT * FROM reviews WHERE review_id = ? AND user_id = ?",
        [id, user_id]
      );
      if (!exist) {
        this.s = 0;
        this.m = "Review not found or not authorized";
        return this.send_res(res);
      }

      await this.delete(
        "DELETE FROM reviews WHERE review_id = ? AND user_id = ?",
        [id, user_id]
      );

      this.s = 1;
      this.m = "Review deleted successfully";
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }

  // Get all reviews for a doctor
  async getDoctorReviews(req, res, next) {
    try {
      const { id } = req.params; // doctor_id

      const reviews = await this.select(
        `SELECT r.review_id, r.rating, r.review_text, r.created_at,
                u.name AS reviewer_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.doctor_id = ?
         ORDER BY r.created_at DESC`,
        [id]
      );

      this.s = 1;
      this.m = "Reviews fetched successfully";
      this.r = reviews;
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }
}
