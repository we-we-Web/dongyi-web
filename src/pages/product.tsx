'use client'

import React, { useEffect, useState } from 'react';
import Product from '../app/model/product';
import { useRouter } from 'next/navigation';
import NavigationBar from '../app/component/NavigationBar';
import Image from 'next/image';
import '../globals.css';

export default function ProductContent() {
    const [product, setProduct] = useState<Product | null>(null);
    const router = useRouter();
    const [amount, setQuantity] = useState<number>(1);

    useEffect(() => {
        const getProduct = async(id: string) => {
            const url = `https://dongyi-api.hnd1.zeabur.app/product/products/${id}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const result = await response.json();
                    setProduct(result);
                    console.log(`Get product ${id} successfully`);
                } else {
                    console.error('failed to fetch:', response.status);
                }
            } catch(err) {
                console.error('error:', err);
            }
        }

        const productID = localStorage.getItem("product");
        if (!productID) {
            console.error("failed to get product id from local storage.");
            // TODO
            router.push('/');
            return ;
        }
        getProduct(productID);
    }, []);

    useEffect(() => {
        if (product?.name) {
            document.title = product.name;
        }
    }, [product]);
    
    const addtoCart = async (id: string) => {
        const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd`;
    
        try {
            // Step 1: 從 localStorage 獲取原本的數量
            const localCart = localStorage.getItem("cart");
            let cartData = localCart ? JSON.parse(localCart) : {}; // 確保為合法 JSON
            let currentQuantity = cartData[id]?.quantity || 0; // 如果不存在，默認為 0
    
            // Step 2: 計算最終的數量
            const finalQuantity = currentQuantity + amount;
    
            // Step 3: 更新 localStorage
            cartData = {
                ...cartData,
                [id]: { product: product?.id, quantity: finalQuantity },
            };
            localStorage.setItem("cart", JSON.stringify(cartData));
    
            console.log('Updated cart:', cartData);
    
            // Step 4: 發送更新請求到後端
            const request = {
                id: id,
                product: `${product?.id}`,
                quantity: finalQuantity,
            };
    
            console.log('request body:', request);
    
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                alert('Updated cart item successfully');
            } else if (response.status === 404) {
                console.log('Cart not found');
            } else {
                console.log('Failed to update cart:', response.status);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };    

    if (!product) return <p>Loading...</p>;
    return (
        <div className="flex h-[100%] w-[100%] pt-[10vh]">
            <NavigationBar />
            <div className='flex m-8'>
                <Image 
                    src={product.image ?? "/default.png"}
                    className='mr-[5vw] border-gray-400 border object-contain'
                    alt={product.name}
                    width={800}
                    height={800}
                />
                <div className="flex-col basis-1/2 pr-[10vw]">
                    <h1 className="text-[4em] font-bold">{product.name}</h1>
                    <div className="text-[3em] text-red-700 font-bold">{product.price} <span className="text-[0.5em]">元</span> </div>
                    <div>{product.description}</div>
                    <div className="flex items-center mt-[2em]">
                        <button 
                            className="bg-gray-300 w-[2em] h-[2em] text-black hover:opacity-60" 
                            onClick={() => setQuantity(amount > 1 ? amount - 1 : 1)}>
                                -
                        </button>
                        <input 
                            type="number" 
                            className="w-[4em] text-center mx-[1em] border border-gray-400" 
                            value={amount} 
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min="1"
                        />
                        <button 
                            className="bg-gray-300 w-[2em] h-[2em] text-black hover:opacity-60" 
                            onClick={() => setQuantity(amount + 1)}>
                                +
                        </button>
                    </div>
                    <button 
                        className="bg-[#9F79EE] w-[10em] h-[2em] text-white mt-[1em]  hover:opacity-60" 
                        onClick={() => addtoCart(`demo@gmail.com`)}>
                            add to cart
                    </button>
                </div>
            </div>
        </div>
    );
}
