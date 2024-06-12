import express from "express";
import customerDB from "../database/customer";
export const router = express.Router();
import { getImageFromS3 } from "../storage";

router.get("/get_product", async (req, res) => {
  console.log("get_product");
  const product = await customerDB.query_product();
  for (let i = 0; i < product.length; i++) {
    if (product[i].imgKey == "")
      product[i].img = await getImageFromS3({ key: "default.jpg" });
    else if (
      [".jpeg", ".jpg", ".png", ".gif"].some((extension) =>
        product[i].imgKey.includes(extension),
      )
    ) {
      const suffixIndex = product[i].imgKey.lastIndexOf(".");
      product[i].img = await getImageFromS3({
        key: product[i].imgKey.substring(0, suffixIndex),
      });
    } else {
      product[i].img = await getImageFromS3({ key: product[i].imgKey });
    }
  }
  res.send(product);
});

router.post("/get_comments", async (req, res) => {
  const evaluation = await customerDB.query_specific_evaluation(req.body.PID);
  res.send(evaluation);
});

router.post("/get_amount", async (req, res) => {
  const [amount] = await customerDB.query_amount(req.body.PID);
  res.send(amount.PNum.toString());
});

router.post("/get_cart", async (req, res) => {
  const cart = await customerDB.query_cart(req.body.UID);
  res.send(cart);
});

router.post("/add_to_cart", async (req, res) => {
  await customerDB.add_to_cart(req.body);
  res.sendStatus(200);
});

router.post("/add_order", async (req, res) => {
  const data = req.body.order;
  for (let order of data) {
    await customerDB.add_order(order);
  }
  res.sendStatus(200);
});

router.get("/get_all_order", async (req, res) => {
  const order = await customerDB.get_all_order();
  res.send(order);
});

type orderID = {
  PID: string;
  UID: string;
};

router.delete(
  "/delete_cart",
  async (req: { query: { orderID: orderID[] | orderID } }, res) => {
    if (Array.isArray(req.query.orderID)) {
      for (let id of req.query.orderID) {
        await customerDB.delete_cart(id);
      }
    } else {
      await customerDB.delete_cart(req.query.orderID);
    }
    res.send(200);
  },
);
