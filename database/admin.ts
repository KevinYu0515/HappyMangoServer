import { ProductDataBaseType } from '../types';
import { execute } from './database';

export default {
    query_product: async (): Promise<any> => {
        return new Promise((resolve, reject) => {
            execute(`SELECT
                    PID as id,
                    PName as name,
                    PType as type,
                    Picture as imgKey
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
                    ROUND((SELECT AVG(Grade) FROM evaluation), 1) AS avgEvaluationScore,
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
            execute(`DELETE p
                    FROM product as p
                    LEFT JOIN evaluation as e ON e.PName = p.PName
                    WHERE p.PID = ?;`, [id], (err: any, res: any) => {
            if(err) return reject(err);
            resolve(res);
            })
        })
    },

    query_specific_product: (id: string) => {
        return new Promise((resolve, reject) => {
            execute(`SELECT
                    p.PName as name,
                    p.PNum as count,
                    PType as type,
                    p.Price as price,
                    p.SalePrice as salePrice,
                    p.PDescribe as description,
                    CONCAT_WS('/', p.BBDYear, p.BBDMonth, p.BBDDate) AS date,
                    COUNT(e.ENo) as ecount,
                    ROUND(Avg(e.Grade), 1) as score
                    FROM
                    product as p
                    LEFT JOIN
                    evaluation as e ON p.PID = e.PID
                    WHERE
                    p.PID=?`, [id], (err: any, res: any) => {
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