import express from 'express';
import db from "./database/database";
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as dotenv from "dotenv";
import { router as customer_router }from "./routes/customer";
import { router as admin_router }from "./routes/admin";
import { loginData } from './types';

dotenv.config();
const app = express();

app.use(cors())
app.use(bodyParser.json({limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/customer', customer_router);
app.use('/admin', admin_router);

// 本地端儲存設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// 上傳設定
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024, fieldSize: 25 * 1024 * 1024} , storage: storage })

// 身分驗証
app.post('/login', async (req, res) => {
  const [customer_result] = await db.check_user(req.body.username, req.body.password) as loginData[];
  const [seller_result] = await db.check_seller(req.body.username, req.body.password) as loginData[];
  if(seller_result) res.send({result: 'Admin Login', ...seller_result});
  else if(customer_result) res.send({result: 'User Login', ...customer_result});
  else res.send({result: "No exist"});
})

// 本地端儲存檔案
app.use('/images', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});