import React, { useEffect, useState } from 'react';
import LogoutButton from '../app/component/LogoutButton';
import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '../app/model/userProfile';
import { useRouter } from 'next/router';
import Loading from '../app/component/Loading';
import Link from 'next/link';
import NavigationBar from '../app/component/NavigationBar';

interface User {
    id: string,
    name: string,
    orders: string[],
    created_at: string,
    updated_at: string,
};

function User() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const decoded: UserProfile = jwtDecode(token);
                fetchUser(decoded.email, decoded.name);
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

    return (
        <>
            <NavigationBar />
            <div className="mt-28 px-6 max-w-4xl mx-auto">
                {/* 使用者資訊區 */}
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

                {/* 訂單列表 */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h2>
                    {user.orders && user.orders.length > 0 ? (
                        <ul className="space-y-4">
                            {user.orders.map((orderId) => (
                                <li key={orderId} className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        Order #{orderId}
                                    </span>
                                    <Link 
                                        href={`/order?id=${orderId}`} 
                                        className="text-purple-600 text-sm hover:underline"
                                    >
                                        View Details
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">You have no orders yet.</p>
                    )}
                </div>

                {/* 登出按鈕 */}
                <div className="text-right mt-6">
                    <LogoutButton />
                </div>
            </div>
        </>
    );
};

export default User;