import { ProductDataBaseType } from "../types";
import mysql from 'mysql';
import * as dotenv from "dotenv";
import { CartProductType, OrderType } from "../types";
dotenv.config();

const pool: any = mysql.createPool({
  connectionLimit: 5,
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : parseInt(process.env.RDS_PORT as string),
  database : process.env.RDS_DATABASE
});

export const execute = (query: string, params: any =[], callback: any) => {
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

  check_user: (username: string, password: string) => {
    return new Promise((resolve, reject) => {
      execute(`SELECT *
                FROM customer
                WHERE UName=? AND UPassword=?`, [username, password], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        }
      )
    })
  },

  check_seller: (username: string, password: string) => {
    return new Promise((resolve, reject) => {
      execute(`SELECT *
                FROM seller
                WHERE SName=? AND SPassword=?`, [username, password], (err: any, res: any) => {
          if(err) return reject(err);
          resolve(res);
        }
      )
    })
  }
}