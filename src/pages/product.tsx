'use server'

import React, { useEffect, useState } from 'react';
import { Product, ProductSpec } from '../app/model/product';
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';
import { GetServerSideProps } from 'next';
import { UserProfile } from '../app/model/userProfile';
import { jwtDecode } from 'jwt-decode';
import LoginPopup from '../app/component/LoginPopup';
import Loading from '../app/component/Loading';
import ProductImage from '../app/component/ProductImage';

export const getServerSideProps: GetServerSideProps = async(context) => {
    const ProductId = context.query!;
    try {
        const url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${ProductId.id}`;
        const response = await fetch(url);
        if (response.ok) {
            const product: Product = await response.json();
            console.log(`Get product ${ProductId.id} successfully`);
            return { props: { product } };
        } else {
            console.error('failed to fetch:', response.status);
            return { props: {} };
        }
    } catch(err) {
        console.error('error:', err);
        return { props: {} };
    }
}

export default function ProductContent({ product }: { product: Product }) {
    const [email, setEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const {email}: UserProfile = jwtDecode(token);
                setEmail(email);
            } catch (error) {
                console.error("無效的 JWT:", error);
                localStorage.removeItem('access-token');
            }
        }
    }, []);
    
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const [quantity, setQuantity] = useState<number>(1);

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        if (value > 0 && selectedSize && value <= product.size[selectedSize]) {
            setQuantity(value);
        }
    };

    const handleQuantityIncrease = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleQuantityDecrease = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen py-10">
            <NavigationBar />
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full mt-20">
                <div className="flex flex-col md:flex-row md:space-x-8">
                    <div className="flex-1 rounded-lg border border-slate-300">
                        <ProductImage id={product.id} name={product.name} isIndex={false} />
                    </div>

                    <div className="flex-1 flex flex-col space-y-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {product.name}
                        </h1>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="text-lg font-semibold text-purple-600">
                            ${product.price}
                        </p>

                        <div>
                            <h2 className="text-gray-700 font-semibold mb-2">Size:</h2>
                            <div className="flex space-x-2">
                                {Object.keys(product.size).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeSelect(size)}
                                        className={`px-4 py-2 rounded-lg border ${
                                            selectedSize === size
                                                ? "bg-purple-600 text-white"
                                                : "bg-gray-200 text-gray-800"
                                        } hover:bg-purple-500 hover:text-white`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {selectedSize && (
                                <p className="text-sm text-green-600 mt-2">
                                    Selected size: {selectedSize} (Stock: {product.size[selectedSize]})
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <h2 className="text-gray-700 font-semibold">Quantity:</h2>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleQuantityDecrease}
                                    className={`px-3 py-2 rounded ${
                                        quantity <= 1
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-30"
                                            : "bg-gray-200 hover:bg-violet-600 hover:text-white"
                                    }`}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-16 text-center border border-gray-300 rounded-lg"
                                />
                                <button
                                    onClick={handleQuantityIncrease}
                                    className={`px-3 py-2 rounded ${
                                        selectedSize && quantity >= product.size[selectedSize]
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-30"
                                            : "bg-gray-200 hover:bg-violet-600 hover:text-white"
                                    }`}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button className="bg-violet-500 text-white px-6 py-3 rounded-lg shadow hover:bg-violet-700">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
