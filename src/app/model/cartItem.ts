import { Product, ProductSpec } from "./product"

export interface CartItem {
    product: string
    spec: ProductSpec[]
}

export interface CartViewItem {
    product: Product
    spec: ProductSpec[]
    isSelected: boolean
}