'use server';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';
import { UserProfile } from '../app/model/userProfile';
import { jwtDecode } from 'jwt-decode';
import { CartItem, CartViewItem } from '../app/model/cartItem';

export default function CartPage() {
    const router = useRouter();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartViewItems, setCartViewItems] = useState<CartViewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState('');

    useEffect(() => {

        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const {email}: UserProfile = jwtDecode(token);
                setEmail(email);
                return ;
            } catch (error) {
                console.error("無效的 JWT:", error);
                localStorage.removeItem('access-token');
            }
        }
        alert('Error Occur...');
        router.push('/');
    }, []);

    useEffect(() => {
        if (email !== '') {
            fetchCart();
        }
    }, [email]);

    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            setupCart();
        }
    }, [cartItems]);

    const fetchCart = async() => {
        if (email === '') {
            console.log('email is empty');
            return ;
        }
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/cart-get';
        const request = {
            'id': `${email}`,
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (response.ok) {
                const result = await response.json();
                // console.log(result);
                setCartItems(result.products);
            } else {
                console.log('fetch cart failed:', response.status);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const setupCart = async() => { // parse CartItem into CartViewItem
        if (!cartItems || cartItems.length <= 0) return ;

        const newCartViewItems: CartViewItem[] = (
            await Promise.all(
                cartItems.map( async(item) => {
                    const url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${item.product}`;
                    const response = await fetch(url);
                    if (response.ok) {
                        const product = await response.json();
                        return {
                            product: product,
                            spec: item.spec,
                            isSelected: false,
                        } as CartViewItem;
                    }
                    return undefined;
                })
            )
        ).filter((item): item is CartViewItem => item !== undefined);

        console.log(newCartViewItems);

        setCartViewItems(newCartViewItems);
        setIsLoading(false);
    }
    
    if (isLoading) return <>loading</>

    return (
        <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-50 bg-white shadow-md">
                <NavigationBar />
            </div>
            <section className="flex-1 mt-28 ml-16 px-4">
                {cartViewItems && cartViewItems.length === 0 ? (
                    <p className="text-center text-gray-600">The cart is empty</p>
                ) : (
                    <ul className="space-y-4">
                        {cartViewItems.map((item, index) => (
                            <li key={index} className="flex items-center space-x-4">
                                <input type="checkbox" className="mr-2" />
                                <span title={item.product.name} className="text-gray-800">
                                    {item.product.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}