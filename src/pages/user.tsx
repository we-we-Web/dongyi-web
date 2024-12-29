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
import { Product } from '../app/model/product';

function UserPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [collections, setCollections] = useState<Product[]>([]);
    const [currentView, setCurrentView] = useState<'collections' | 'orders'>('orders'); // 預設顯示 Orders

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
                fetchCollections(result.id);
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

    const fetchCollections = async (userId: string) => {
        const url = `https://dongyi-api.hnd1.zeabur.app/user/collections/${userId}`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setCollections(result);
            } else {
                console.error('Fetch collections error:', response.status);
            }
        } catch (err) {
            console.error(err);
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
    const renderContent = () => {
        if (currentView === 'collections') {
            return collections.length > 0 ? (
                <ul className="space-y-4">
                    {collections.map((product) => (
                        <li key={product.id} className="flex items-center space-x-4">
                            <img
                                src={product.image ? product.image[0] : '/placeholder.png'}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="text-gray-800 font-semibold">{product.name}</p>
                                <p className="text-gray-500 text-sm">${product.price.toFixed(2)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No collections found.</p>
            );
        }

        if (currentView === 'orders') {
            return user.orders && user.orders.length > 0 ? (
                <ul className="space-y-4">
                    {user.orders.map((orderId) => (
                        <li key={orderId} className="flex justify-between items-center">
                            <span className="text-gray-500">Order #{orderId}</span>
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
            );
        }
    };

    return (
        <>
            <NavigationBar />
            <div className="mt-28 px-6 max-w-4xl mx-auto">
                <div className="bg-white shadow-md rounded-lg p-6 mb-8 relative">
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {user.name}</h1>
                    <p className="text-gray-600">Email: {user.id}</p>
                    <p className="text-gray-600">
                        Member since: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                        Last updated: {new Date(user.updated_at).toLocaleDateString()}
                    </p>
                    <div className="absolute bottom-4 right-4">
                        <LogoutButton />
                    </div>
                </div>
    
                <div className="grid grid-cols-12 gap-6 bg-white shadow-md rounded-lg p-6">
                    <div className="col-span-12 md:col-span-3 flex flex-col items-stretch space-y-4">
                        <button
                            className={`w-full px-6 py-3 rounded-lg text-sm font-medium ${
                                currentView === 'collections'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                            onClick={() => setCurrentView('collections')}
                        >
                            Collections
                        </button>
                        <button
                            className={`w-full px-6 py-3 rounded-lg text-sm font-medium ${
                                currentView === 'orders'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                            onClick={() => setCurrentView('orders')}
                        >
                            Orders
                        </button>
                    </div>
    
                    <div className="col-span-12 md:col-span-9">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {currentView === 'collections' ? 'Collections' : 'Orders'}
                        </h2>
                        {currentView === 'collections' ? (
                            collections.length > 0 ? (
                                <ul className="space-y-2">
                                    {collections.map((product) => (
                                        <li key={product.id} className="flex items-center space-x-4">
                                            <img
                                                src={product.image ? product.image[0] : '/placeholder.png'}
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded-md"
                                            />
                                            <div>
                                                <p className="text-gray-800 font-semibold">{product.name}</p>
                                                <p className="text-gray-500 text-sm">
                                                    ${product.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">No collections found.</p>
                            )
                        ) : user.orders && user.orders.length > 0 ? (
                            <ul className="space-y-2">
                                {user.orders.map((orderId) => (
                                    <li key={orderId} className="flex justify-between items-center">
                                        <span className="text-gray-500">Order #{orderId}</span>
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
                </div>
            </div>
        </>
    );
              
}    
export default UserPage;