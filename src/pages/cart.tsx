'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';
import Link from 'next/link';
import { CartItem } from '../app/model/cartItem';

export default function CartPage() {
    const router = useRouter();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const createCart = async (id: string) => {
            const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/cart-create`;
            const request = {
                id: id,
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
                    console.log('create cart successfully');
                    return result;
                } else {
                    console.log('failed to create cart:', response.status);
                }

            } catch (err) {
                console.error('error:', err);
            }
        }
        const getCart = async (id: string) => {
            const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/cart-get`;
            const request = {
                id: id,
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
                    console.log('get cart successfully');
                    return await result;
                } else if (response.status === 404) {
                    console.log('cart not found so create the cart');
                    const result = createCart(id);
                    return result;
                } else {
                    console.log('failed to fetch cart:', response.status);
                }

            } catch (err) {
                console.error('error:', err);
            }
        }
        const getProduct = async (id: string) => {
            const url = `https://dongyi-api.hnd1.zeabur.app/product/products/${id}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const result = await response.json();
                    console.log(`Get product ${id} successfully`);
                    return result;
                } else {
                    console.error('failed to fetch:', response.status);
                }
            } catch (err) {
                console.error('error:', err);
            }
        }
        const setupCart = async (id: string) => {
            interface productItemProps {
                product: string
                quantity: number
            }

            const cartModel = await getCart(id); // 用 cart id fetch cart model
            const cartProducts: productItemProps[] = cartModel.products; // set up cart products 只需要 cart model 的 products props

            const cartItems: CartItem[] = await Promise.all(
                cartProducts.map(async (productItem) => {
                    const product = await getProduct(productItem.product);
                    return {
                        product: product,
                        quantity: productItem.quantity,
                        isSelected: false,
                    } as CartItem;
                })
            );
            setCart(cartItems);
            setLoading(false);
        }
        const id = `demo@gmail.com`;
        setupCart(id);
    }, []);

    useEffect(() => {
        console.log('Cart updated:', cart);
    }, [cart]);

    const updateQuantity = async (productID: string, delta: number) => {
        const updatedCart = cart.map((item) => {
            if (item.product.id === productID) {
                const newQuantity = item.quantity + delta;
                if (newQuantity > 0) {
                    return { ...item, quantity: newQuantity }; // 更新數量
                } else {
                    return null; // 若數量為 0，標記為移除
                }
            }
            return item;
        }).filter(Boolean) as CartItem[]; // 過濾掉被移除的商品

        // 更新狀態
        setCart(updatedCart);

        // 同步到 localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        console.log('Updated cart saved to localStorage:', updatedCart);

        // 更新到後端
        const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd`;
        const id = `demo@gmail.com`;
        const request = {
            id: id,
            product: `${productID}`,
            quantity: updatedCart.find(item => item.product.id === productID)?.quantity || 0,
        }
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                console.log('failed to update cart:', response.status);
            }
        } catch (err) {
            console.error('error:', err);
        }
    };
    // 全選或取消全選商品
    const toggleSelectAll = () => {
        const allSelected = cart.every((item) => item.isSelected);
        setCart(
            cart.map((item) => ({
                ...item,
                isSelected: !allSelected,
            }))
        );
    };

    const toggleCheckout = (productId: string) => {
        setCart(
            cart.map((item) =>
                item.product.id === productId
                    ? { ...item, isSelected: !item.isSelected }
                    : item
            )
        );
    };

    const removeFromCart = async (productID: string) => {
        const url = `https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd`;
        const id = `demo@gmail.com`;
        const request = {
            id: id,
            product: `${productID}`,
            quantity: 0,
        }
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (response.ok) {
                setCart(cart.filter(item => item.product.id !== productID));
                alert('remove cart successfully');
                localStorage.setItem("cart", JSON.stringify(cart.filter(item => item.product.id !== productID)));
            } else {
                console.log('failed to fetch cart:', response.status);
            }
        } catch (err) {
            console.error('error:', err);
        }
    };

    const applyCoupon = () => {
        if (coupon === 'IDME1202') {
            setDiscount(0.1); // 10% 折扣
        } else {
            alert('無效的折價券');
        }
    };

    const calculateTotal = () => {
        return cart
            .filter((item) => item && item.isSelected)
            .reduce((total, item) => total + item.product.price * item.quantity, 0) * (1 - discount);
    };


    // 新增訂單清單至 local storage
    const addOrderlist = () => {
        let arr: CartItem[];
        localStorage.removeItem("orderList");
        if (localStorage.getItem("orderList") == null) {
            arr = cart.filter((item) => item.isSelected);
            localStorage.setItem("orderList", JSON.stringify(arr));
        } else {
            const orderList = localStorage.getItem("orderList");
            arr = orderList ? JSON.parse(orderList) : [];
            arr = cart.filter((item) => item.isSelected);
            localStorage.setItem("orderList", JSON.stringify(arr));
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <>
            <NavigationBar />
            <div className="container mx-auto p-4">
                <h1 className="fixed top-0 left-0 text-2xl font-bold mb-4 p-4 bg-white w-full z-10">購物車頁面</h1>

                <div className="cart">
                    <h2 className="text-xl font-semibold mb-2 p-6 relative mt-16">購物車</h2>
                    {cart.length > 1 && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                onChange={toggleSelectAll}
                                checked={cart.every((item) => item.isSelected)}
                            />
                            <span>全選</span>
                        </div>
                    )}
                    {cart.length === 0 ? (
                        <p>購物車是空的。</p>
                    ) : (
                        <ul className='min-h-96'>
                            {cart.map((item, index) => item && (
                                <div key={index}>
                                    <li className="flex flex-col md:flex-row justify-between items-center mb-2 mt-5">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                onChange={() => toggleCheckout(item.product.id)}
                                                checked={item.isSelected ?? false}
                                            />
                                            <Link
                                                href="product"
                                                onClick={() => localStorage.setItem('product', JSON.stringify(item.product.id))}
                                            >
                                                <span title={item.product.name}> {/* 顯示完整商品名稱 */}
                                                    {item.product.name} - NT${item.product.price} x {item.quantity}
                                                </span>
                                            </Link>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                            >
                                                -
                                            </button>
                                            <button
                                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                            >
                                                +
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                                                onClick={() => removeFromCart(item.product.id)}
                                            >
                                                移除
                                            </button>
                                        </div>
                                    </li>
                                    <hr />
                                </div>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="coupon mt-4">
                    <h2 className="text-xl font-semibold mb-2">使用折價券</h2>
                    <input
                        type="text"
                        placeholder="輸入折價券"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="border px-2 py-1 mr-2"
                    />
                    <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700"
                        onClick={applyCoupon}
                    >
                        確認
                    </button>
                </div>

                <div className="checkout mt-4">
                    <h2 className="text-xl font-semibold mb-2">結算</h2>
                    <p>總金額：NT${calculateTotal().toFixed(2)}</p>
                    <Link href="order">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
                            disabled={cart.every((item) => item && !item.isSelected)}
                            onClick={() => { alert('前往結帳頁面'); addOrderlist(); }}
                        >
                            前往結帳
                        </button>
                    </Link>
                </div>

                <div className="mt-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                        onClick={() => router.push('/')}
                    >
                        返回首頁
                    </button>
                </div>
            </div>
        </>
    );
}