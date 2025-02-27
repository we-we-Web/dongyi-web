export interface Product {
    id: string
    name: string
    price: number
    size: ProductSpec
    image?: string[]
    description: string
    discount?: number
    categories?: string
    isFavorite?: boolean
}

export interface ProductSpec {
    [key: string]: number
}