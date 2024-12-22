import { ProductSpec } from "./product"

export interface OrderItem {
    id: string
    price: number
    spec: ProductSpec
};

export interface OrderViewItem {
    product: string
    name: string
    price: number
    total: number
    spec: ProductSpec
}