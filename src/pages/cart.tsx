'use server';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import NavigationBar from '../app/component/NavigationBar';
import { UserProfile } from '../app/model/userProfile';
import { jwtDecode } from 'jwt-decode';
import { CartItem, CartViewItem } from '../app/model/cartItem';
import Loading from '../app/component/Loading';
import Link from 'next/link';
import { FaRegTrashAlt } from "react-icons/fa";
import '../globals.css';

export default function CartPage() {
    const router = useRouter();

    const [cartItems, setCartItems] = useState<CartItem[] | null>(null);
    const [cartViewItems, setCartViewItems] = useState<CartViewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
        if (cartItems) {
            if (cartItems.length > 0) {
                setupCart();
            } else {
                setIsLoading(false);
            }
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
            } else if (response.status === 404) {
                createCart(email);
            } else {
                console.log('fetch cart failed:', response.status);
            }
        } catch (err) {
            console.log(err);
        }
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
                setEmail(result);
            } else {
                console.error('create cart error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    }

    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = cartViewItems.filter((item) => item.isSelected).reduce((sum, item) => {
                const itemTotal = item.product.price * Object.values(item.spec).reduce((a, b) => a + b, 0);
                return sum + itemTotal;
            }, 0);
            setTotalPrice(total);
        };

        calculateTotalPrice();
    }, [cartViewItems]);

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

    const calculateItemTotal = (item: CartViewItem) => {
        return (
            item.product.price * Object.values(item.spec).reduce((a, b) => a + b, 0)
        );
    };

    const toggleSelection = (productId: string) => {
        setCartViewItems((prevItems) =>
            prevItems.map((item) =>
                item.product.id === productId
                    ? { ...item, isSelected: !item.isSelected }
                    : item
            )
        );
    };

    const deleteProductItem = async(productId: string) => {
        setCartViewItems((prevItems) =>
            prevItems.filter((item) => item.product.id !== productId)
        );
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/item-remove';
        const request = {
            id: email,
            product: `${productId}`,
        };
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (response.ok) {
                setToast({ message: "Remove successfully!", type: "success" });
            } else {
                setToast({ message: `Ocurr an error when remove: ${response.status}`, type: "error" });
            }
        } catch (err) {
            console.log(err);
            setToast({ message: `Failed to remove: ${err}`, type: "error" });
        }
        setTimeout(() => setToast(null), 1500);
    };

    const deleteProductSpec = async(productId: string, specKey: string, quantity: number) => {
        setCartViewItems((prevItems) =>
            prevItems.map((item) =>
                item.product.id === productId
                    ? {
                          ...item,
                          spec: Object.fromEntries(
                              Object.entries(item.spec).filter(([key]) => key !== specKey)
                          ),
                      }
                    : item
            )
        );
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd';
        const request = {
            id: email,
            product: `${productId}`,
            size: specKey,
            delta: -quantity,
            remaining: 100,
        };
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (response.ok) {
                setToast({ message: "Remove successfully!", type: "success" });
            } else {
                setToast({ message: `Ocurr an error when remove: ${response.status}`, type: "error" });
            }
        } catch (err) {
            console.log(err);
            setToast({ message: `Failed to remove: ${err}`, type: "error" });
        }
        setTimeout(() => setToast(null), 1500);
    };

    const createOrder = async() => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/order/api/order-create';
        const content = cartViewItems.filter((item) => item.isSelected).map(item => {
            return {
                id: item.product.id,
                price: item.product.price,
                spec: item.spec,
            };
        })
        const request = {
            owner: email,
            content: content,
        };
        console.log(request);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            })
            if (response.ok) {
                setToast({ message: "Create order successfully!", type: "success" });
                const result = await response.json();
                return result.id;
            } else {
                setToast({ message: `Ocurr an error when create order: ${response.status}`, type: "error" });
            }
        } catch (err) {
            console.log(err);
            setToast({ message: `Failed to create order: ${err}`, type: "error" });
        }
        setTimeout(() => setToast(null), 1500);
    }

    const clearCart = async() => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/cart-clear';
        const request = {
            id: email,
        };
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (response.ok) {
                setToast({ message: "Create order successfully!", type: "success" });
                const result = await response.json();
                return result.id;
            } else {
                setToast({ message: `Ocurr an error when create order: ${response.status}`, type: "error" });
            }
        } catch (err) {
            console.log(err);
            setToast({ message: `Failed to create order: ${err}`, type: "error" });
        }
        setTimeout(() => setToast(null), 1500);
    }

    const placeOrder = async() => {
        // create order -> add order to user -> clear cart -> navigate to order page
        const id = await createOrder();
        if (!id) return ;
        const url = 'https://dongyi-api.hnd1.zeabur.app/user/account/order-add';
        const request = {
            id: email,
            order: id,
        };
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            })
            if (response.ok) {
                setToast({ message: "Place order successfully!", type: "success" });
            } else {
                setToast({ message: `Ocurr an error when place order: ${response.status}`, type: "error" });
            }
        } catch (err) {
            console.log(err);
            setToast({ message: `Failed to place order: ${err}`, type: "error" });
        }
        clearCart();
        setTimeout(() => setToast(null), 1500);
        router.push(`/order?id=${id}`);
    }
    
    if (isLoading) return <Loading />

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white shadow-md">
                <NavigationBar />
            </header>
    
            <main className="flex flex-1 flex-col items-center py-8 px-4 mt-20">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
                
                {cartViewItems && cartViewItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-gray-600 text-lg">The cart is empty</p>
                    </div>
                ) : (
                    <ul className="w-full max-w-4xl space-y-6">
                        {cartViewItems.map(item => (
                            <li key={item.product.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <input 
                                            type="checkbox" 
                                            onClick={() => toggleSelection(item.product.id)}
                                            className="w-5 h-5 text-blue-600 rounded" 
                                        />
                                        <Link href={`/product?id=${item.product.id}`}>
                                        <p title={item.product.name} className="text-lg font-medium text-gray-800">
                                            {item.product.name}
                                        </p>
                                        <p className="text-gray-600">
                                            ${item.product.price}
                                        </p>
                                        </Link>
                                    </div>
                                    <button 
                                        onClick={() => deleteProductItem(item.product.id)}
                                        className="text-sm text-red-500 hover:opacity-50"
                                    >
                                        <FaRegTrashAlt size={20} />
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
                                                    <button 
                                                        onClick={() => deleteProductSpec(item.product.id, key, item.product.size[key])}
                                                        className='pl-4 hover:opacity-50'
                                                    >
                                                        <FaRegTrashAlt />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-2 text-right text-gray-800 font-semibold">
                                    Total: ${calculateItemTotal(item).toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
    
            {cartViewItems && cartViewItems.length > 0 && (
                <footer className="bg-white shadow-md mt-auto py-4">
                    <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
                        <p className="text-gray-800 text-lg font-semibold">Total: ${totalPrice}</p>
                        <button 
                            onClick={() => placeOrder() }
                            className="bg-violet-500 text-white px-6 py-2 rounded-md shadow hover:bg-violet-700"
                        >
                            Place Order
                        </button>
                    </div>
                </footer>
            )}
            {toast && (
                <div
                    className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${
                        toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}