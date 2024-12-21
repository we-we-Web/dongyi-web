'use client'

import '../globals.css';
import { GetServerSideProps } from 'next';
import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '../app/model/userProfile';
import { useEffect, useState } from 'react';
import { ProductSpec } from '../app/model/product';
import Loading from '../app/component/Loading';
import NavigationBar from '../app/component/NavigationBar';
import Link from 'next/link';
import { useRouter } from 'next/router';


interface OrderItem {
    id: string
    price: number
    spec: ProductSpec
};

interface OrderViewItem {
    product: string
    name: string
    price: number
    total: number
    spec: ProductSpec
}

export default function OrderPage() {
    const router = useRouter();
    const { id } = router.query;
    const [orderItems, setOrderItems] = useState<OrderItem[] | null>(null);
    const [orderViewItems, setOrderViewItems] = useState<OrderViewItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getEmail = () => {
            const token = localStorage.getItem('access-token');
            if (token) {
                try {
                    const { email }: UserProfile = jwtDecode(token);
                    return email;
                } catch (error) {
                    console.error("無效的 JWT:", error);
                    localStorage.removeItem('access-token');
                }
            }
        }
    
        const fetchOrder = async(id: string, email: string) => {
            const url = 'https://dongyi-api.hnd1.zeabur.app/order/api/order-get';
            const request = {
                id: `${id}`,
                owner: email,
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
                    setOrderItems(result.content);
                }
            } catch (err) {
                console.log(err);
            }
        }
        const email: string = getEmail()!;
        if (id && typeof id === 'string' && email) {
            fetchOrder(id, email);
        }
    }, []);

    useEffect(() => {
        if (!orderItems) return ;
        const setupOrderViewItems = async() => {
            const items: OrderViewItem[] = (
                await Promise.all(
                    orderItems.map(async(item) => {
                        const url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${item.id}`;
                        const response = await fetch(url);
                        if (response.ok) {
                            const result = await response.json();
                            const totalPrice = item.price * Object.values(item.spec).reduce((a, b) => a + b, 0)
                            return {
                                product: item.id,
                                name: result.name,
                                price: item.price,
                                total: totalPrice,
                                spec: item.spec,
                            };
                        }
                        return undefined;
                    })
                )
            ).filter(item => item !== undefined);
            setOrderViewItems(items);
            setIsLoading(false);
        }
        setupOrderViewItems();
    }, [orderItems]);

    if (isLoading) return <Loading />

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen py-10">
            <NavigationBar />
            <div className="max-w-4xl w-full mt-20">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h1>
                {orderViewItems && orderViewItems.length > 0 ? (
                    <ul className="space-y-6">
                        {orderViewItems.map((item) => (
                            <li
                                key={item.product}
                                className="bg-white shadow-lg rounded-lg p-6"
                            >
                                <Link href={`/product?id=${item.product}`}>
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        {item.name}
                                    </h2>
                                </Link>
                                <p className='mb-3 text-gray-400'>
                                    $NT{item.price}
                                </p>
                                <ul className="space-y-2">
                                    {Object.entries(item.spec).map(([size, quantity]) => (
                                        <li
                                            key={size}
                                            className="flex justify-between text-gray-600"
                                        >
                                            <span>{size}</span>
                                            <span>{quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-gray-200 mt-4 pt-4 text-right">
                                    <p className="text-lg font-bold text-gray-800">
                                        Total: ${item.total.toFixed(2)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-600">No items in this order.</p>
                )}
            </div>
        </div>
    )
}