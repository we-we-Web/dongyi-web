'use server'

import React, { useEffect, useState } from 'react';
import Product from '../app/model/product';
import { useRouter } from 'next/router';
import NavigationBar from '../app/component/NavigationBar';
import Image from 'next/image';
import '../globals.css';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async(context) => {
    const ProductId = context.query!;
    // console.log('id:', id);
    // const getProduct = async(id: string) => {
    try {
        const url = `https://dongyi-api.hnd1.zeabur.app/product/products/${ProductId.id}`;
        const response = await fetch(url);
        if (response.ok) {
            const product: Product = await response.json();
            console.log(`Get product ${ProductId.id} successfully`);
            return { props: { product } };
        } else {
            console.error('failed to fetch:', response.status);
            return { props: {} };
        }
    } catch(err) {
        console.error('error:', err);
        return { props: {} };
    }
    // }

    // const productID = localStorage.getItem("product");
    // const router = useRouter();
    // if (!productID) {
    //     console.error("failed to get product id from local storage.");
    //     // TODO
    //     router.push('/');
    //     return { props: { data: [] } };
    // }
    // getProduct(productID);
}

export default function ProductContent({ product }: { product: Product }) {
    // const [product, setProduct] = useState<Product | null>(null);
    const [productNum, setProductNum] = useState(1);

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (product?.name) {
            document.title = product.name;
        }
    }, [product]);
    
    const addtoCart = async(id: string) => {
        const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd`;
        const request = {
            id: id,
            product: `${product?.id}`,
            delta: productNum,
            remaining: product?.remain_amount,
        }
        console.log('request body:', request);
        try {
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
                alert('upd cart item successfully');
            } else if (response.status === 404) {
                console.log('cart not found');
            } else {
                console.log('failed to upd cart:', response.status);
            }
        } catch (err) {
            console.error('error:', err);
        }
    };

    const add = () => {
        setProductNum(productNum+1);
    }
    const minus = () => {
        if(productNum <= 2) setProductNum(1);
        else setProductNum(productNum-1);
    }

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
                    priority={true}
                />
                <div className="flex-col basis-1/2 pr-[10vw]">
                    <h1 className="text-[4em] font-bold">{product.name}</h1>
                    <div className="text-[3em] text-red-700 font-bold">{product.price} <span className="text-[0.5em]">元</span> </div>
                    <div>{product.description}</div>
                    <div className="flex flex-col items-center mt-5">
                        <div className="flex items-center justify-center w-full space-x-2">
                            <button onClick={minus} className="flex-1 bg-gray-200 hover:bg-gray-400 text-[2em]">
                                -
                            </button>
                            <span className="flex-1 text-center">{productNum}</span>
                            <button onClick={add} className="flex-1 bg-gray-200 hover:bg-gray-400 text-[2em]">
                                +
                            </button>
                        </div>
                        <button 
                            className="bg-red-700 w-full h-[2em] text-white mt-0 hover:opacity-60" 
                            onClick={() => addtoCart(`demo@gmail.com`)}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
