import express from 'express';
import db from "./database";
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ProductViewType, OrderOverViewType, loginData } from './types';
import { uploadToS3, getImageFromS3 } from './storage';
import * as dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors())
app.use(bodyParser.json({limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ limits: { fileSize: 100 * 1024 * 1024, fieldSize: 25 * 1024 * 1024} , storage: storage })

app.get('/get_product', async (req, res) => {
  try {
    const product = await db.query_product();
    
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
});

app.get('/get_product_evaluation', async (req, res) => {
  try{
    const evaluation = await db.query_product_evaluation((req.query as {name: string}).name);
    res.json(evaluation);
  } catch (err) {
    console.error(err);
  }
})

app.get('/get_all_order', async (req, res) => {
  const order = await db.query_All_order() as OrderOverViewType[];
  const convertedOrder = {
    unchecked: order.filter(o => o.type === 'unchecked'),
    onprogress: order.filter(o => o.type === 'onprogress'),
    done: order.filter(o => o.type === 'done'),
    cancel: order.filter(o => o.type === 'cancel'),
  }
  res.json(convertedOrder);
})

app.get('/get_seller', async (req, res) => {
  const seller = await db.query_seller();
  res.json(seller);
})

app.get('/get_specific_order', async (req, res) => {
  const order: any = await db.query_specific_order((req.query as {id: string}).id);
  res.json(order);
})

app.get('/get_seller_overview', async (req, res) => {
  const overview = await db.query_seller_overview();
  res.json(overview);
})

app.get('/get_specific_product', async (req, res) => {
  const [product]: any = await db.query_specific_product((req.query as {id: string}).id);
  res.json(product);
})

app.post('/update_product', async (req, res) => {
  const data: ProductViewType = req.body;
  await db.update_product({
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
})

app.post('/update_seller', async (req, res) => {
  const data = req.body;
  await db.update_seller({
    id: data.id,
    name: data.name,
    address: data.address,
    phone: data.phone,
    description: data.description
  })
  res.sendStatus(200);
})

app.post('/add_new_product', async (req, res) => {
  const data: ProductViewType = req.body;
  await db.add_product({
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
})

app.post('/delete_product', async (req, res) => {
  await db.delete_product(req.body.id);
  res.sendStatus(200);
})

app.post('/delete_order', async (req, res) => {
  await db.delete_order(req.body.id, req.body.factor);
  res.sendStatus(200);
})

app.post('/confirm_order', async (req, res) => {
  await db.confirm_order(req.body.id);
  res.sendStatus(200);
})

app.post('/upload_product_image', uploadToS3.single('file'), (req: any, res) => {
  res.send(`${req.file.key}.jpeg`);
});

app.post('/login', async (req, res) => {
  const customer_result = await db.check_user(req.body.username, req.body.password) as loginData[];
  const seller_result = await db.check_seller(req.body.username, req.body.password) as loginData[];
  if(customer_result.length == 0 && seller_result.length == 0) res.sendStatus(404);
  else if(customer_result.length > 0) res.sendStatus(200);
  else res.send('Admin Login');
})

app.use('/images', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});