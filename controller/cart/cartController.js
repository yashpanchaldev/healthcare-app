import { Base } from "../../service/base.js";

export default class cartController extends Base {
  constructor() {
    super();
  }

  // Add product to cart
  async AddCart(req, res, next) {
    try {
      const { product_id, quantity } = req.body;
      const user_id = req._id;

      if (this.varify_req(req, ["product_id", "quantity"])) {
        return this.send_res(res);
      }

      const existing = await this.selectOne(
        "SELECT * FROM cart WHERE product_id = ? AND user_id = ?",
        [product_id, user_id]
      );

      if (existing) {
        if (existing.status === 0) {
          // Reactivate the item
          await this.update(
            "UPDATE cart SET quantity = ?, status = 1 WHERE cart_id = ?",
            [quantity, existing.cart_id]
          );
        } else {
          // Already active, just increase quantity
          await this.update(
            "UPDATE cart SET quantity = quantity + ? WHERE cart_id = ?",
            [quantity, existing.cart_id]
          );
        }
      } else {
        await this.insert(
          "INSERT INTO cart (user_id, product_id, quantity, status) VALUES (?,?,?,1)",
          [user_id, product_id, quantity]
        );
      }

      this.s = 1;
      this.m = "Product added to cart successfully.";
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }

  // Get all active cart items
  async AllMyCart(req, res, next) {
    try {
      const user_id = req._id;
      const items = await this.select(
        "SELECT * FROM cart WHERE user_id = ? AND status = 1",
        [user_id]
      );

      for (let i = 0; i < items.length; i++) {
        const product = await this.selectOne(
          "SELECT * FROM medicines WHERE medicine_id = ?",
          [items[i].product_id]
        );

        const images = await this.select(
          "SELECT * FROM medicine_media WHERE medicine_id = ?",
          [items[i].product_id]
        );

        items[i].cartProduct = product;
        items[i].images = images;
      }

      this.s = 1;
      this.m = "Cart fetched successfully";
      this.r = items;
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }

  // Soft delete cart (status = 0)
  async removeCart(req, res, next) {
    try {
      const { id: cart_id } = req.params;
      const user_id = req._id;

      const exist = await this.selectOne(
        "SELECT * FROM cart WHERE cart_id = ? AND user_id = ?",
        [cart_id, user_id]
      );

      if (!exist) {
        this.s = 0;
        this.m = "Cart item not found";
        return this.send_res(res);
      }

      await this.update(
        "UPDATE cart SET status = 0 WHERE cart_id = ? AND user_id = ?",
        [cart_id, user_id]
      );

      this.s = 1;
      this.m = "Cart item removed successfully";
      this.r = exist;
      return this.send_res(res);
    } catch (err) {
      this.err = err.message;
      return this.send_res(res);
    }
  }

  // Update cart quantity
  async updateCart(req, res, next) {
    try {
      const { id: cart_id } = req.params;
      const { quantity } = req.body;
      const user_id = req._id;

      const exist = await this.selectOne(
        "SELECT * FROM cart WHERE cart_id = ? AND user_id = ? AND status = 1",
        [cart_id, user_id]
      );

      if (!exist) {
        this.s = 0;
        this.m = "Cart item not found or inactive";
        return this.send_res(res);
      }

      await this.update(
        "UPDATE cart SET quantity = ? WHERE cart_id = ? AND user_id = ?",
        [quantity, cart_id, user_id]
      );

      this.s = 1;
      this.m = "Cart item updated successfully";
      this.r = exist;
      return this.send_res(res);
    } catch (error) {
      this.err = error.message;
      return this.send_res(res);
    }
  }
}
