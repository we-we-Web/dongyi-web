'use server'

import React, { useEffect, useState } from 'react';
import Product from '../app/model/product';
import NavigationBar from '../app/component/NavigationBar';
import Image from 'next/image';
import '../globals.css';
import { GetServerSideProps } from 'next';
import { UserProfile } from '../app/model/userProfile';
import { jwtDecode } from 'jwt-decode';
import LoginPopup from '../app/component/LoginPopup';

export const getServerSideProps: GetServerSideProps = async(context) => {
    const ProductId = context.query!;
    try {
        const url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${ProductId.id}`;
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
}

export default function ProductContent({ product }: { product: Product }) {
    const [email, setEmail] = useState('');
    const [productNum, setProductNum] = useState(1);
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [addingBtnText, setAddingBtnText] = useState('Add to Cart');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);

    useEffect(() => {
        document.body.style.overflow = isLoginOpen ? 'hidden' : 'auto';
    }, [isLoginOpen]);

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const {email}: UserProfile = jwtDecode(token);
                setEmail(email);
            } catch (error) {
                console.error("無效的 JWT:", error);
                localStorage.removeItem('access-token');
            }
        }
    }, []);

    useEffect(() => {
        if (product?.name) {
            document.title = product.name;
        }
    }, [product]);
    
    const addtoCart = async(id: string) => {
        if (id === '') {
            setLoginOpen(true);
        }
        const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd`;
        const request = {
            id: id,
            product: `${product?.id}`,
            size: product.size,
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
                setAddingBtnText('Successfully!');
                setTimeout(() => {
                    setAddingBtnText('Add to Cart');
                }, 600);
                return ;
            } else if (response.status === 404) {
                console.log('cart not found');
            } else {
                console.log('failed to upd cart:', response.status);
            }
        } catch (err) {
            console.error('error:', err);
        }
        setAddingBtnText('Failed...');
        setTimeout(() => {
            setAddingBtnText('Add to Cart');
        }, 600);
    };

    
    const Popup = ({onClose}: {onClose: () => void}) => {
        const handleClickOutside = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        };
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleClickOutside}>
                <div className="bg-white p-8 rounded-lg w-80 shadow-lg">
                    <div className="my-4 text-center font-bold">
                        可訂購數量已達上限
                    </div>
                    <button 
                        onClick={onClose} 
                        className="mt-2 text-gray-500 hover:text-gray-700 w-full text-center">
                        關閉
                    </button>
                </div>
            </div>
        );
    };
    const add = () => {
        if(productNum < selectedSize?.quantity){
            setProductNum(productNum+1);
        }
        else if(productNum === product.remain_amount){
            setProductNum(productNum);
            setShowPopup(true);
        }   
    }
    const minus = () => {
        if(productNum <= 2) setProductNum(1);
        else setProductNum(productNum-1);
    }

    if (!product) return <p>Loading...</p>;
    return (
        <div className="flex h-[100%] w-[100%] pt-[10vh]">
            {showPopup && <Popup onClose={()=>setShowPopup(false)} />}
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
                <div className="flex-col pr-[10vw]">
                    <h1 className="text-[4em] font-bold">{product.name}</h1>
                    <div className="text-[3em] text-red-700 font-bold">
                        {product.price} 
                        <span className="text-[0.5em]">元</span> 
                    </div>
                    <div>{product.description}</div>
                    <div className="flex flex-col mt-16">
                        <div className="flex flex-col">
                            <div className="flex gap-1">
                                {Object.entries(product.size).map(([key, value]) =>(
                                    <button key={key} onClick={()=>setSelectedSize({size:key, quantity:value})} className="flex items-center justify-center w-8 h-8 
                                    bg-gray-100 hover:bg-gray-400 text-[1em] rounded-xl">
                                        {key}
                                    </button>
                                ))}
                            </div>
                            
                            {selectedSize && (
                                <div className="mt-2 mb-2 ml-2">
                                    {selectedSize.size}剩餘數量:{selectedSize.quantity}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-center w-36 m-0">
                            <button onClick={minus} className="flex items-center justify-center w-8 h-8 
                                                            bg-gray-200 hover:bg-gray-400 text-[2em]">
                                -
                            </button>
                            <span className="w-20 text-center">{productNum}</span>
                            <button onClick={add} className="flex items-center justify-center 
                                                            w-8 h-8 bg-gray-200 hover:bg-gray-400 text-[2em]">
                                +
                            </button>
                        </div>
                        <button 
                            className="bg-[#9F79EE] w-36 h-[2em] text-white mt-0 hover:opacity-60" 
                            onClick={() => addtoCart(email)}>
                            {addingBtnText}
                        </button>
                    </div>
                </div>
            </div>
            {isLoginOpen &&
                <LoginPopup
                    onClose={() => setLoginOpen(false)} 
                />
            }
        </div>
    );
}
