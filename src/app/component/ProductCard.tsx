import { Product } from "../model/product";
import ProductImage from "./ProductImage";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product}) {
    return (
        <Link 
            href={`/product?id=${product.id}`}
            className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-slate-300 min-h-[300px] h-full cursor-pointer"
        >
            <ProductImage id={product.id} name={product.name} isIndex={true} index={0}/>
            <div className="p-4 flex flex-col justify-between flex-grow">
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-gray-500">{product.categories}</p>
                {!product.discount ? (
                    <p className="text-black font-bold text-xl mt-2">
                        {product.price}元
                    </p>
                ) : (
                    <div className="mt-1">
                        <p className="text-gray-500 line-through text-xl">
                            {product.price}元
                        </p>
                        <p className="text-[#9F79EE] font-bold text-xl">
                            {(product.price * (1 - product.discount / 100)).toFixed(2)}元
                            <span className="text-[#9F79EE] text-sm ml-2">
                                {product.discount}% off
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
};