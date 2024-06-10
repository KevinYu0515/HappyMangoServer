import express from "express";
import adminDB from '../database/admin';
export const router = express.Router();
import { getImageFromS3, uploadToS3 } from "../storage";
import { OrderOverViewType, ProductViewType } from "../types";

router.get('/get_product', async (req, res) => {
    try {
      const product = await adminDB.query_product();
      
      for(let i = 0; i < product.length; i++){
        if(product[i].imgKey == "") product[i].img = await getImageFromS3({key: 'default.jpg'});
        else if([".jpeg", ".jpg", ".png", ".gif"].some(extension => product[i].imgKey.includes(extension))){
          const suffixIndex = product[i].imgKey.lastIndexOf(".");
          product[i].img = await getImageFromS3({key: product[i].imgKey.substring(0, suffixIndex)});
        }
        else{
          product[i].img = await getImageFromS3({key: product[i].imgKey});
        }
      }
  
      res.json(product);
    } catch (err) {
      console.error(err);
    }
  }
);

router.get('/get_product_evaluation', async (req, res) => {
    try{
      const evaluation = await adminDB.query_product_evaluation((req.query as {name: string}).name);
      res.json(evaluation);
    } catch (err) {
      console.error(err);
    }
  }
);
  
router.get('/get_all_order', async (req, res) => {
    const order = await adminDB.query_All_order() as OrderOverViewType[];
    const convertedOrder = {
      unchecked: order.filter(o => o.type === 'unchecked'),
      onprogress: order.filter(o => o.type === 'onprogress'),
      done: order.filter(o => o.type === 'done'),
      cancel: order.filter(o => o.type === 'cancel'),
    }
    res.json(convertedOrder);
  }
);
  
router.get('/get_seller', async (req, res) => {
    const seller = await adminDB.query_seller();
    res.json(seller);
  }
);
  
router.get('/get_specific_order', async (req, res) => {
    const order: any = await adminDB.query_specific_order((req.query as {id: string}).id);
    res.json(order);
  }
);
  
router.get('/get_seller_overview', async (req, res) => {
    const overview = await adminDB.query_seller_overview();
    res.json(overview);
  }
);
  
router.get('/get_specific_product', async (req, res) => {
    const [product]: any = await adminDB.query_specific_product((req.query as {id: string}).id);
    res.json(product);
  }
);
  
router.post('/update_product', async (req, res) => {
    const data: ProductViewType = req.body;
    await adminDB.update_product({
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      price: data.price,
      salePrice: data.salePrice,
      count: data.count,
      year: data.year,
      month: data.month,
      day: data.day,
      imagePath: data.imagePath
    });
    res.sendStatus(200);
  }
);
  
router.post('/update_seller', async (req, res) => {
    const data = req.body;
    await adminDB.update_seller({
      id: data.id,
      name: data.name,
      address: data.address,
      phone: data.phone,
      description: data.description
    })
    res.sendStatus(200);
  }
);
  
router.post('/add_new_product', async (req, res) => {
    const data: ProductViewType = req.body;
    await adminDB.add_product({
      name: data.name,
      type: data.type,
      description: data.description,
      count: data.count,
      price: data.price,
      salePrice: data.salePrice,
      year: data.year,
      month: data.month,
      day: data.day,
      imagePath: data.imagePath
    });
    res.sendStatus(200);
  }
);
  
router.post('/delete_product', async (req, res) => {
    await adminDB.delete_product(req.body.id);
    res.sendStatus(200);
  }
);
  
router.post('/delete_order', async (req, res) => {
    await adminDB.delete_order(req.body.id, req.body.factor);
    res.sendStatus(200);
  }
);
  
router.post('/confirm_order', async (req, res) => {
    await adminDB.confirm_order(req.body.id);
    res.sendStatus(200);
  }
);
  
router.post('/upload_product_image', uploadToS3.single('file'), (req: any, res) => {
    res.send(`${req.file.key}.jpeg`);
  }
);