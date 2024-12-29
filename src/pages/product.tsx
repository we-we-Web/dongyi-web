'use server'

import React, { useEffect, useState } from 'react';
import { Product } from '../app/model/product';
import { GetServerSideProps } from 'next';
import { UserProfile } from '../app/model/userProfile';
import { jwtDecode } from 'jwt-decode';
import ProductImageGallery from '../app/component/ProductImageGallery';
import FavoriteButton from '../app/component/FavoriteButton';

import ProductCard from '../app/component/ProductCard';
import NavigationBar from '../app/component/NavigationBar';

import LoginPopup from '../app/component/LoginPopup';
import '../globals.css';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async(context) => {
    const ProductId = context.query!;
    try {
        let url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${ProductId.id}`;
        let response = await fetch(url);
        if (response.ok) {
            const product: Product = await response.json();
            const recommendedProducts: Product[] = [];
            console.log(`Get product ${ProductId.id} successfully`);
            for(let i = 1; i <= 2; i++) { 
                url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${i}`;
                response = await fetch(url);
                if (response.ok) {
                    recommendedProducts.push(await response.json());
                    console.log(`Get recommendedProducts ${i} successfully`);
                } else {
                    console.error('failed to fetch:', response.status);
                }
            }
            return { props: { product, recommendedProducts} };
        } else {
            console.error('failed to fetch:', response.status);
            return { props: {} };
        }
    } catch(err) {
        console.error('error:', err);
        return { props: {} };
    }
}

export default function ProductContent({ product, recommendedProducts }: { product: Product, recommendedProducts: Product[] }) {
    const [email, setEmail] = useState('');
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

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
        if(localStorage.getItem("isAdmin") === "true") {
            setIsAdmin(true);
        }
    }, []);
    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            if (email) {
                const url = `https://dongyi-api.hnd1.zeabur.app/favorites/api/check-favorite?email=${email}&productId=${product.id}`;
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const { isFavorite } = await response.json();
                        setIsFavorite(isFavorite);
                    }
                } catch (error) {
                    console.error('Error fetching favorite status:', error);
                }
            }
        };
    
        fetchFavoriteStatus();
    }, [email, product.id]);
    

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        setQuantity(1);
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

    const handleAddToCart = async () => {
        if (!selectedSize) {
            setToast({ message: "Please select a size.", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        if (email === '') {
            setIsLoginOpen(true);
            return ;
        }

        const stock = product.size[selectedSize];
        if(quantity > stock) {
            setToast({ message: "The stock is not enough.", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        const url = 'https://dongyi-api.hnd1.zeabur.app/cart/api/item-upd';
        const request = {
            id: email,
            product: `${product.id}`,
            size: selectedSize,
            delta: quantity,
            remaining: product.size[selectedSize],
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
                setToast({ message: "Added to cart successfully!", type: "success" });
            } else {
                setToast({ message: `Occur an error when add to cart: ${response.status}`, type: "error" });
            }
        } catch (error) {
            console.log(error);
            setToast({ message: "Failed to add to cart.", type: "error" });
        }

        setTimeout(() => setToast(null), 3000);
    };
    const handleToggleFavorite = async () => {
        if (email === '') {
            setIsLoginOpen(true); 
            return;
        }
    
        const url = 'https://dongyi-api.hnd1.zeabur.app/favorite/api/item-toggle'; 
        const request = {
            id: email,
            product: `${product.id}`,
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
                if (result.isFavorite) {
                    setToast({ message: "Added to favorites successfully!", type: "success" });
                } else {
                    setToast({ message: "Removed from favorites.", type: "success" });
                }
            } else {
                setToast({
                    message: `Error occurred while updating favorites: ${response.status}`,
                    type: "error",
                });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: "Failed to update favorites.", type: "error" });
        }
    
        setTimeout(() => setToast(null), 3000); // 提示訊息3秒後自動隱藏
    };        
    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen py-10">
            <NavigationBar />
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full mt-20">
                <div className="flex flex-col md:flex-row md:space-x-8">
                <div className="flex-1 rounded-lg border border-slate-300 relative">
                    <div className="absolute top-2 right-2 z-10">
                        <FavoriteButton
                            productId={product.id}
                            isFavorite={isFavorite}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    </div>
                    <ProductImageGallery id={product.id} name={product.name} isIndex={false} index={0} />
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
                                {Object.keys(product.size).map((size) => {
                                    const stock = product.size[size];
                                    const isOutOfStock = stock === 0;
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => !isOutOfStock && handleSizeSelect(size)}
                                            disabled={isOutOfStock}
                                            className={`px-4 py-2 rounded-lg border ${
                                                selectedSize === size
                                                    ? "bg-purple-600 text-white"
                                                    : isOutOfStock
                                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                                        : "bg-gray-200 text-gray-800"
                                            } 
                                            ${!isOutOfStock && "hover:bg-purple-500 hover:text-white"} 
                                            ${isOutOfStock && "opacity-50"}
                                            `}
                                            title={isOutOfStock ? "Out of stock" : `Select size ${size}`}
                                        >
                                            {size} {isOutOfStock && "(Sold out)"}
                                        </button>
                                    );
                                })}
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
                                    min="1"
                                    max={selectedSize ? product.size[selectedSize] : undefined}
                                />
                                <button
                                    onClick={handleQuantityIncrease}
                                    className={`px-3 py-2 rounded ${
                                        selectedSize && quantity >= product.size[selectedSize]
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-30"
                                            : "bg-gray-200 hover:bg-violet-600 hover:text-white"
                                    }`}
                                    disabled={selectedSize ? quantity >= product.size[selectedSize] : true}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleAddToCart()}
                            className="bg-violet-500 text-white px-6 py-3 rounded-lg shadow hover:bg-violet-700">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
            {isAdmin ? 
                (<Link href={{ pathname: '/admin', query: { id: product.id } }}>Admin</Link>) : ''}
            
            <div className="bg-white shadow-lg rounded-lg p-12 max-w-4xl w-full mt-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center">推薦商品</h1>
                <div className="flex flex-wrap mx-4 mt-6">
                    {   
                        recommendedProducts && recommendedProducts.map((product) => (
                            <div className='w-full h-96 md:w-1/2 px-4 mt-4' key={product.id}>
                                <ProductCard product={product} />
                            </div>
                    ))}
                </div>
            </div>
            {toast && (
                <div
                    className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${
                        toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {toast.message}
                </div>
            )}
            {isLoginOpen &&
                <LoginPopup
                    onClose={() => setIsLoginOpen(false)} 
                />
            }
        </div>
    );
}
