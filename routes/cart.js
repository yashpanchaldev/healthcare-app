import {Router } from "express"
import cartController from "../controller/cart/cartController.js"

const router = Router()

router.route("/add-cart").post((req, res, next) => {
  const a = new cartController();
  return a.AddCart(req, res, next);
});
router.route("/").get((req, res, next) => {
  const a = new cartController();
  return a.AllMyCart(req, res, next);
});

router.route("/:id").delete((req,res,next)=>{
  const c = new cartController()
  return c.removeCart(req,res,next)
})

router.route("/:id").put((req,res,next)=>{
  const c = new cartController()
  return c.updateCart(req,res,next)
})

export default router