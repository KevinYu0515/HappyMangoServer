import { CartProductType, OrderType } from '../types';
import { execute } from './database';

export default {
    query_product: async (): Promise<any> => {
      return new Promise((resolve, reject) => {
        execute(`SELECT
                  PID,
                  PName,
                  PNum,
                  Picture as imgKey,
                  Price,
                  SalePrice,
                  PDescribe,
                  BBDYear,
                  BBDMonth,
                  BBDDate,
                  PType
                FROM product;`, [], (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        })
      })
    },
    
    query_specific_evaluation: async (id: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        execute(`SELECT 
                  e.Grade,
                  e.Speed,
                  e.EComment,
                  c.UName as PName
                FROM evaluation as e, customer as c
                WHERE e.PID=? AND c.UID=e.UID;`, [id], (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        })
      })
    },

    query_amount: async (id: string): Promise<[{PNum: number}]> => {
      return new Promise((resolve, reject) => {
        execute(`SELECT 
                  PNum
                FROM product
                WHERE PID=?;`, [id], (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        })
      })
    },

    query_cart: async (UID: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        execute(`SELECT c.PID, c.PName, c.BNum, p.SalePrice as Sell, TMoney
                 FROM cart as c, product as p
                 WHERE c.UID=? AND c.PID=p.PID;`, [UID], (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        })
      })
    },

    add_to_cart: async (product: CartProductType): Promise<any> => {
      return new Promise((resolve, reject) => {
        execute(`INSERT INTO cart(UID, PID, PName, BNum, TMoney)
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    BNum = BNum + VALUES(BNum),
                    TMoney = TMoney + VALUES(TMoney);`, 
          [product.UID, product.PID, product.PName, product.BNum, product.TMoney], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        })
      })
    },

    add_order: async (order: OrderType): Promise<any> => {
      return new Promise((resolve, reject) => {
        execute(`INSERT INTO cus_order(ONo, PID, PName, BNum, TMoney, Way, OType, ShipAddress, ShipMethod, ShipWhere, Note, UID, OTime, ATime, SName, OCancelFactor)
                  VALUES (SUBSTRING(UUID(), 1, 8), ?, ?, ?, ?, ?, 'unchecked', ?, ?, 'not shipped', ?, ?, NOW(), NULL, 'Jerry Lin', NULL);`, 
          [order.PID, order.PName, order.BNum, order.TMoney, order.Way, order.ShipAddress, order.ShipMethod, order.Note, order.UID], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        })
      })
    },
  
    get_all_order: async (): Promise<OrderType[]> => {
      return new Promise((resolve, reject) => {
        execute(`SELECT 
                  ONo,
                  ShipWhere,
                  ShipAddress,
                  OType,
                  UID,
                  JSON_ARRAYAGG(JSON_OBJECT('PName', PName, 'BuyNum', BNum)) AS orderItems
                FROM 
                  cus_order
                GROUP BY 
                  ONo, ShipWhere, ShipAddress, OType, UID
                `, [], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        })
      })
    },

    delete_cart: async (ID: {PID: string, UID: string}): Promise<any> => {
      return new Promise((resolve, reject) => {
        execute(`DELETE FROM cart
                  WHERE PID=? AND UID=?; `, [ID.PID, ID.UID], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        })
      })
    }
}