import React, { useEffect, useState } from 'react';
import LogoutButton from '../app/component/LogoutButton';
import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '../app/model/userProfile';
import { useRouter } from 'next/router';
import Loading from '../app/component/Loading';
import Link from 'next/link';
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';
import { User } from '../app/model/userModel';



function UserPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orderStatus, setOrderStatus] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const decoded: UserProfile = jwtDecode(token);
                fetchUser(decoded.email, decoded.name).then(()=>{
                    if (user) fetchOrder(decoded.email);
                });
            } catch (error) {
                console.error("無效的 JWT:", error);
            }
        } else {
            router.push('/');
        }
    }, []);

    const fetchUser = async(email: string, name: string) => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/user/account/account-get';
        const request = {
            "id": `${email}`,
        }
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
                setUser(result);
            } else if (response.status === 404) {
                createUser(email, name);
                createCart(email);
            } else {
                console.error('fetch user error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    };

    const createUser = async(email: string, name: string) => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/user/account/account-create';
        const request = {
            "id": `${email}`,
            "name": `${name}`,
        }
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
                setUser(result);
            } else {
                console.error('create user error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    };

    if (!user) {
        return <Loading />;
    }

    const createCart = async(email:string) => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/cart-create';
        const request = {
            "id": `${email}`,
        }
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
                setUser(result);
            } else {
                console.error('create cart error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    }

    const fetchOrder = async (email: string) => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/order/api/order-get';
        const tmp = new Map<string, string>();
    
        await Promise.all(
            user.orders.map(async (orderId) => {
                const request = {
                    id: orderId,
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
                        tmp.set(orderId, result.status);
                    }
                } catch (err) {
                    console.error(`At ${orderId}:`, err);
                }
            })
        );
        setOrderStatus(tmp);
    };

    return (
        <>
            <NavigationBar />
            <div className="mt-28 px-6 max-w-4xl mx-auto">
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {user.name}</h1>
                    <p className="text-gray-600">Email: {user.id}</p>
                    <p className="text-gray-600">
                        Member since: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                        Last updated: {new Date(user.updated_at).toLocaleDateString()}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h2>
                    {user.orders && user.orders.length > 0 ? (
                        <ul className="space-y-4">
                            {user.orders.map((orderId) => (
                                <li key={orderId} className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        Order #{orderId}  
                                    </span>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-gray-600">{orderStatus.get(orderId)}</span>
                                        <Link 
                                            href={`/order?id=${orderId}`} 
                                            className="text-purple-600 text-sm hover:underline"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">You have no orders yet.</p>
                    )}
                </div>

                <div className="text-right mt-6">
                    <LogoutButton />
                </div>
            </div>
        </>
    );
};

export default UserPage;