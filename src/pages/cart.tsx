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
            }
        } else {
            router.push('/');
        }
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

        // console.log(newCartViewItems);
        setCartViewItems(newCartViewItems);
        setIsLoading(false);
    }

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [modificationCache, setModificationCache] = useState<{
        [key: string]: Tmp
    }>({});

    const initializeCache = (productID: string, size: string, remaining: number) => {
        let cacheInitialized = false;
        let initializedCache: { size: string; delta: number; remaining: number } = { size, delta: 0, remaining };
    
        setModificationCache((prevCache) => {
            // 如果快取尚未初始化
            if (!prevCache[productID]) {
                cacheInitialized = true;
                return {
                    ...prevCache,
                    [productID]: initializedCache,
                };
            }
            initializedCache = prevCache[productID];
            return prevCache;
        });
    
        // 返回最新的快取值
        if (!cacheInitialized) {
            initializedCache = modificationCache[productID];
        }
        return initializedCache;
    };
    
    const modifySpec = async(productID: string, size: string, delta: number, remaining: number, quantity: number) => {
        const res = quantity + delta;
        if (res >= remaining || res <= 0) return ;
        setCartViewItems((prevItems) =>
            prevItems.map((item) => {
                if (item.product.id === productID) {
                    const updatedSpec = {
                        ...item.spec,
                        [size]: item.spec[size] + delta,
                    };
                    return {
                        ...item,
                        spec: updatedSpec,
                    };
                }
                return item;
            })
        );
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd';
        const request = {
            id: email,
            product: `${productID}`,
            size: size,
            delta: delta,
            remaining: remaining,
        };
        console.log(request);
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                console.log('failed to modify spec:', response.status);
            }
        } catch (err) {
            console.log(err);
        }
    }
        // while(!modificationCache[productID]) {
        //     setModificationCache((prevCache) => {
        //         const newCache = { ...prevCache };
        //         newCache[productID] = {size, delta: 0, remaining};
        //         return newCache;
        //     })
        // }
    //     initializeCache(productID, size, remaining);
    //     console.log(modificationCache);

    //     setModificationCache((prevCache) => {
    //         let newCache = { ...prevCache };
    //         if (!newCache[productID]) {
    //             newCache[productID] = {
    //                 size: size,
    //                 delta: 0,
    //                 remaining: remaining,
    //             };
    //         }
    //         const tmp = quantity + newCache[productID].delta;

    //         if (tmp <= remaining && tmp >= 1) {
    //             newCache[productID].delta += delta;
    //             setCartViewItems((prevItems) =>
    //                 prevItems.map((item) => {
    //                     if (item.product.id === productID) {
    //                         const updatedSpec = {
    //                             ...item.spec,
    //                             [size]: item.spec[size] + delta,
    //                         };
    //                         return {
    //                             ...item,
    //                             spec: updatedSpec,
    //                         };
    //                     }
    //                     return item;
    //                 })
    //             );
    //         }
    //         return newCache;
    //     });
    //     console.log('current cache:', modificationCache[productID]);
    
    //     if (debounceTimer) {
    //         clearTimeout(debounceTimer);
    //     }
        
    //     const newTimer = setTimeout(async () => {
    //         const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd';
    //         const requests = Object.keys(modificationCache)
    //             .filter((id) => modificationCache[id].delta !== 0)
    //             .map((id) => {
    //                 let delta = modificationCache[id].delta;
    //                 if (delta < 0) delta += 1;
    //                 else if (delta > 0) delta -= 1;
    //                 return {
    //                     id: email,
    //                     product: id,
    //                     size: modificationCache[id].size,
    //                     delta: delta,
    //                     remaining: modificationCache[id].remaining,
    //                 };
    //             });

    //         console.log('Batch request:', requests);
    //         setModificationCache({});
    //         if (requests.length === 0) return ;
    //         try {
    //             await Promise.all(
    //                 requests.map((request) =>
    //                     fetch(url, {
    //                         method: 'PATCH',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                         },
    //                         body: JSON.stringify(request),
    //                     })
    //                 )
    //             );
    //             console.log('All updates successful');
    //         } catch (err) {
    //             console.error('Error updating specs:', err);
    //         }

    //         setDebounceTimer(null);
    //     }, 1200);

    //     setDebounceTimer(newTimer);
    // };
    
    if (isLoading) return <>loading</>

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white shadow-md">
                <NavigationBar />
            </header>
    
            <main className="flex flex-1 flex-col items-center py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
                
                {cartViewItems && cartViewItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-gray-600 text-lg">The cart is empty</p>
                    </div>
                ) : (
                    <ul className="w-full max-w-4xl space-y-6">
                        {cartViewItems.map((item) => (
                            <li key={item.product.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                                        <p title={item.product.name} className="text-lg font-medium text-gray-800">
                                            {item.product.name}
                                        </p>
                                    </div>
                                    <button className="text-sm text-red-500 hover:underline">
                                        Remove
                                    </button>
                                </div>
    
                                <div className="mt-4">
                                    <h3 className="text-gray-700 font-semibold mb-2">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(item.spec).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between bg-gray-100 p-4 rounded-md"
                                            >
                                                <span className="text-gray-800 font-medium">Size: {key}</span>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            modifySpec(item.product.id, key, -1, item.product.size[key], value)
                                                        }
                                                        disabled={value-1 <= 0}
                                                        className={`px-3 py-1 bg-gray-200 rounded hover:bg-gray-300
                                                                    ${value <= 1 && 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-gray-800 font-semibold">
                                                        {value}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            modifySpec(item.product.id, key, 1, item.product.size[key], value)
                                                        }
                                                        disabled={value >= item.product.size[key]}
                                                        className={`px-3 py-1 bg-gray-200 rounded hover:bg-gray-300
                                                            ${value >= item.product.size[key] && 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
    
            {cartViewItems && cartViewItems.length > 0 && (
                <footer className="bg-white shadow-md mt-auto py-4">
                    <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
                        <p className="text-gray-800 text-lg font-semibold">Total: $XXX.XX</p>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700">
                            Proceed to Checkout
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}