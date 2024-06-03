import { ProductDataBaseType } from "./types";
const mysql = require('mysql');
require('dotenv').config();
const pool = mysql.createPool({
  connectionLimit: 5,
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : process.env.RDS_DATABASE
});

const execute = (query: string, params: any =[], callback: any) => {
  pool.getConnection((err: any, connection: any) => {
    if (err) {
      return callback(err);
    }
    console.log("Connected! Use", pool._freeConnections.length);

    connection.query(query, params, (err: any, results: any, fields: any) => {
      connection.release();

      if (err) {
        return callback(err);
      }

      callback(null, results);
    });
  });
}
export default {
  query_product: async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      execute(`SELECT
                  PID as id,
                  PName as name,
                  PNum as count, PType as type,
                  Price as price,
                  SalePrice as salePrice,
                  PDescribe as description,
                  Picture as img,
                  CONCAT_WS('/', BBDYear, BBDMonth, BBDDate) AS date
                  FROM product;`, [], (err: any, res: ProductDataBaseType[]) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  
  query_product_evaluation: async (name: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      execute(`SELECT
                  c.UName as customer,
                  e.Grade as grade,
                  e.Speed as speed,
                  e.EComment as content
                  FROM customer AS c, evaluation AS e
                  WHERE c.UID=e.UID AND e.PName= ?;`,
                 [name], (err: any, res: any) => {
        if (err) return reject(err);
        resolve(res);
      })
    })
  },
  
  query_All_order: () => {
    return new Promise((resolve, reject) => {
        execute(`SELECT DISTINCT
                    o.ONo as id,
                    o.OTime as time,
                    c.UName as customer,
                    o.OType as type
                    FROM cus_order as o, customer as c
                    WHERE o.UID=c.UID;`, [], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },
  
  query_specific_order: (id: string) => {
    return new Promise((resolve, reject) => {
      execute(`SELECT 
                  o.ONo as order_id,
                  o.Way as pay_way,
                  o.ShipAddress as ship_address,
                  o.ShipMethod as ship_way,
                  o.Note as note,
                  o.OTime as order_time,
                  c.UName as customer_name,
                  c.UID as customer_id,
                  c.UPhone as customer_phone,
                  o.PName as product_name,
                  o.BNum as product_count,
                  o.TMoney as product_price,
                  o.OType as type,
                  (SELECT SUM(TMoney) FROM cus_order WHERE ONo = o.ONo) as total_cost
                  FROM cus_order as o, customer as c 
                  WHERE o.ONo = ? AND c.UID = o.UID;`, [id], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  query_seller: () => {
    return new Promise((resolve, reject) => {
      execute(`SELECT
                  Sssn as id,
                  SName as name,
                  SPhone as phone,
                  SAddress as address,
                  SDescription as description
                  FROM seller;`, [], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  update_seller: (seller: any) => {
    return new Promise((resolve, reject) => {
      execute(`UPDATE seller
                 SET SName=?, SPhone=?, SAddress=?, SDescription=? 
                 WHERE Sssn=?`, [seller.name, seller.phone, seller.address, seller.description, seller.id], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  query_seller_overview: () => {
    return new Promise((resolve, reject) => {
      execute(`SELECT 
                (SELECT COUNT(*) FROM evaluation) AS evaluationCount,
                (SELECT COUNT(*) FROM cus_order WHERE OType = 'done') AS doneOrderCount,
                (SELECT AVG(Grade) FROM evaluation) AS avgEvaluationScore,
                (SELECT SUM(TMoney) FROM cus_order WHERE OType = 'done') AS income;`, [],
                (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  update_product: (product: any) => {
    return new Promise((resolve, reject) => {
      execute(`UPDATE product
                 SET PName=?, PNum=?, Picture=?, Price=?, SalePrice=?, PDescribe=?, BBDYear=?, BBDMonth=?, BBDDate=?, PType=?
                 WHERE PID=?;`, [product.name, product.count, product.imagePath, product.price, product.salePrice, product.description, product.year, product.month, product.day, product.type, product.id], (err: any, res: any) => {
        if(err) return reject(err);
         resolve(res);
      })
    })
  },

  add_product: (product: any) => {
    return new Promise((resolve, reject) => {
      execute(`INSERT product(PID, PName, PNum, Picture, Price, SalePrice, PDescribe, BBDYear, BBDMonth, BBDDate, PType, SName)
                 VALUES (SUBSTRING(UUID(), 1, 8), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [product.name, product.count, product.imagePath, product.price, product.salePrice, product.description, product.year, product.month, product.day, product.type, "Jerry Lin"], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  delete_product: (id: string) => {
    return new Promise((resolve, reject) => {
      execute(`DELETE evaluation, product
                  FROM product
                  JOIN evaluation ON evaluation.PName = product.PName
                  WHERE product.PID = ?;`, [id], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  query_specific_product: (id: string) => {
    return new Promise((resolve, reject) => {
      execute(`SELECT
                  COUNT(ENo) as count,
                  Avg(Grade) as score
                  FROM evaluation WHERE PID=?`, [id], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);              
      })
    })
  },

  delete_order: (id: string, factor: string) => {
    return new Promise((resolve, reject) => {
      execute(`UPDATE cus_order
                  SET OType='cancel', OCancelFactor=?
                  WHERE ONo=?`, [factor, id], (err: any, res: any) => {
        if(err) return reject(err);
        resolve(res);
      })
    })
  },

  confirm_order: (id: string) => {
    return new Promise((resolve, reject) => {
      execute(`UPDATE cus_order
                  SET OType='onprogress'
                  WHERE ONo=?`, [id], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        }
      )
    })
  }
}