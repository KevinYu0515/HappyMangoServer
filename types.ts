export interface lessOrderData {
    id: string,
    name: string,
    time: string,
    status: ("onprogress" | "uncheck" | "done")
}

export interface orderDataWithType {
    onprogress: lessOrderData[];
    uncheck: lessOrderData[];
    done: lessOrderData[];
}

export interface ProductDataBaseType {
    BBDDate: number;
    BBDMonth: number;
    BBDYear: number;
    PDescribe: string;
    PName: string;
    PNum: number;
    PType: string;
    Picture: string;
    Price: number;
    SName: string;
    SalePrice: number;
}

export interface ProductViewType {
    id: string,
    name: string,
    type: string,
    description: string,
    price: string,
    salePrice: string,
    count: string,
    year: string,
    month: string,
    day: string,
    imagePath: string
}

export interface OrderOverViewType {
    id: string,
    time: string,
    customer: string,
    type: string
}

export interface loginData {
    username: string,
    password: string
}

export interface CartProductType {
    UID: string,
    PID: string,
    PName: string,
    BNum: number
    TMoney: number
}

export interface OrderType {
    ONo: string,
    PID: string,
    PName: string,
    BNum: number,
    TMoney: number,
    Way: 'land' | 'air' | 'sea',
    OType: 'unchecked' | 'onprogress' | 'done' | 'cancel',
    ShipAddress: string,
    ShipMethod: string,
    ShipWhere: string,
    Note: string,
    UID: string,
    OTime: string,
    ATime: string,
    SName: string,
    OCancelFactor: string
}