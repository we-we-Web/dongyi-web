import React, { useEffect, useState } from 'react';
import { UserProfile } from '../app/model/userProfile';
import { jwtDecode } from 'jwt-decode';

interface OrderContent {
    id: string;
    price: number;
    quantity: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<OrderContent[]>([]);

    useEffect(() => {
        const fetchOrderContent = async (orderIds: string[], email: string) => {
            const url = `https://dongyi-api.hnd1.zeabur.app/order-get`;
            const contents = [];

            for (const orderId of orderIds) {
                const request = { 
                    id: orderId, 
                    owner: email,
                 };
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify(request),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.content) {
                            contents.push(...result.content); 
                        }
                    } else if (response.status === 401) {
                        console.log('unauthorized account');
                    } else if (response.status === 404) {
                        console.log('user or order not found');
                    } else {
                        console.log('Failed to fetch order info:', response.status);
                    }
                } catch (err) {
                    console.error(`Error fetching order ${orderId}:`, err);
                }
            }

            setHistory(contents);
        };

        const fetchUserInfo = async (email: string) => {
            const url = `https://dongyi-api.hnd1.zeabur.app/account/account-get`; //https://dongyi-api.hnd1.zeabur.app/account/account-get
            const request = { 
                id: email, 
            };
            try {
                console.log(request);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(request),
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('User info fetched successfully:', result);
                    if (result.orders && result.id) {
                        await fetchOrderContent(result.orders, result.id);
                    }
                } else if (response.status === 401) {
                    console.log('unauthorized account');
                } else if (response.status === 404) {
                    console.log('user not found');
                } else {
                    console.log('Failed to fetch user info:', response.status);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        };

        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const { email }: UserProfile = jwtDecode(token);
                fetchUserInfo(email);
            } catch (error) {
                console.error('無效的JWT:', error);
                localStorage.removeItem('access-token');
            }
        }
    }, []);

    return (
        <div>
            <h1>Order History</h1>
            {history.length > 0 ? (
                <ul>
                    {history.map((item, index) => (
                        <li key={index}>
                            <p>Product ID: {item.id}</p>
                            <p>Price: {item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No order history found.</p>
            )}
        </div>
    );
}
