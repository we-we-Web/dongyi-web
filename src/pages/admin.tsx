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



function Admin() {
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

    return (
        <>
            <NavigationBar />
            <div className="text-right mt-6">
                <LogoutButton />
            </div>
            <div className="mt-28 px-6 mx-auto flex">
                <div className="w-1/12 flex flex-col space-y-4 p-2">
                    <button className="bg-purple-400 text-white py-2 px-4 rounded">訂單管理</button>
                    <button className="bg-purple-400 text-white py-2 px-4 rounded">
                        <Link href={{pathname: '/update', query: { id: -1 }}}>新增商品</Link>
                    </button>
                </div>
                <div className="w-11/12  h-12">
                    <h1 className="text-2xl font-bold text-center ">訂單管理</h1>
                    <div className='flex space-x-4 mt-6'>
                        <div className='w-1/4 bg-purple-200 rounded-lg p-6 flex flex-col space-y-4 h-11/12'>
                            <h1 className='text-2xl font-bold text-center'>處理中</h1>
                            <div className="bg-white shadow-md rounded-lg p-4">
                                <h1 className='text-lg font-bold'>訂單編號: 2021080001</h1>
                                <h1 className='text-lg font-bold'>訂單日期: 2021/08/01</h1>
                                <h1 className='text-lg font-bold'>訂單金額: $1000</h1>
                                <Link href='/order/2021080001'>
                                    <button className='bg-purple-400 text-white py-2 px-4 rounded'>查看訂單</button>
                                </Link>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-4">
                                <h1 className='text-lg font-bold'>訂單編號: 2021080001</h1>
                                <h1 className='text-lg font-bold'>訂單日期: 2021/08/01</h1>
                                <h1 className='text-lg font-bold'>訂單金額: $1000</h1>
                                <Link href='/order/2021080001'>
                                    <button className='bg-purple-400 text-white py-2 px-4 rounded'>查看訂單</button>
                                </Link>
                            </div>
                        </div>
                        <div className='w-1/4 bg-purple-300 shadow-md rounded-lg p-6'>
                            <h1 className='text-2xl font-bold text-center'>運送中</h1>
                        </div>
                        <div className='w-1/4 bg-purple-400 shadow-md rounded-lg p-6'>
                            <h1 className='text-2xl font-bold text-center'>已完成</h1>
                        </div>
                        <div className='w-1/4 bg-red-300 shadow-md rounded-lg p-6'>
                            <h1 className='text-2xl font-bold text-center'>已取消</h1>                    
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;