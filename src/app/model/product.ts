export interface Product {
    id: string
    name: string
    price: number
    size: ProductSpec[]
    image?: string
    description: string
    discount?: number
    categories?: string
}

export interface ProductSpec {
    size: string
    remaining: number
}