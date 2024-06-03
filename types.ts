interface lessOrderData {
    id: string,
    name: string,
    time: string,
    status: ("onprogress" | "uncheck" | "done")
}

interface orderDataWithType {
    onprogress: lessOrderData[];
    uncheck: lessOrderData[];
    done: lessOrderData[];
}

interface ProductDataBaseType {
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

interface ProductViewType {
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

interface OrderOverViewType {
    id: string,
    time: string,
    customer: string,
    type: string
}

export { lessOrderData, orderDataWithType, ProductDataBaseType, ProductViewType, OrderOverViewType };