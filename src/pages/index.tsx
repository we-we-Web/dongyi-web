import { GetServerSideProps } from 'next';
import ProductCard from '../app/component/ProductCard';
import { Product } from '../app/model/product';
import NavigationBar from '../app/component/NavigationBar';
import { useEffect, useState } from 'react';
import Slider from "react-slick";
import Loading from '../app/component/Loading';
import Image from 'next/image';
import Link from 'next/link';
import { sliderSettings } from '../app/model/sliderSettings';
import { AdsItem } from '../app/model/adsItem';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../globals.css';


export const getServerSideProps: GetServerSideProps = async () => {
    const fetchProducts = async() => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/product/api/product';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: Product[] = await response.json();
            return data;
        } catch (err) {
            console.error("Error fetching data:", err);
            return [];
        }
    }
    const fetchAds = async() => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/ads/api/ads-getall';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result: AdsItem[] = await response.json();
            const data = result.map(item => {
                return {
                    img: item.img,
                    target: item.target,
                };
            })
            return data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }
    const products = await fetchProducts();
    const ads = await fetchAds();
    return { props: {products, ads} };
};

function Home({ products, ads }: { products: Product[], ads: AdsItem[] }) {
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({});

    useEffect(() => {
        const uniqueCategories = Array.from(
            new Set(products.map((product) => product.categories)
                    .filter(Boolean)
                    .filter((category): category is string => category !== undefined))
        );
        setCategories(uniqueCategories);

        const grouped = uniqueCategories.reduce((acc, category) => {
            acc[category] = products.filter((product) => product.categories === category);
            return acc;
        }, {} as Record<string, Product[]>);

        setGroupedProducts(grouped);
        setTimeout(() => {
            setIsLoading(false);
        }, 600);
        
    }, [products]);

    if (isLoading) return <Loading />

    return (
        <>
            <NavigationBar />
            <div className="mx-auto my-6 mt-32 max-w-screen-2xl shadow-2xl rounded-xl">
                <Slider {...sliderSettings} >
                    {
                        ads && ads.length > 0 && ads.map(item => (
                            <Link href={item.target} target={`${item.target === '/' ? '' : '_blank'}`}>
                                <div className="h-[500px] flex items-center justify-center rounded-xl">
                                    <Image
                                        src={item.img}
                                        alt="Ads"
                                        width={1500}
                                        height={300}
                                        loading='lazy'
                                        className="object-cover w-full h-full rounded-xl"
                                    />
                                </div>
                            </Link>
                        ))
                    }
                </Slider>
            </div>
            <div className="container mx-auto px-4 py-8 mt-16">
                <h1 className="text-4xl font-bold text-center mb-12">商品列表</h1>

                {categories.map((category) => (
                    <div key={category} className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-300 pb-2">
                            {category}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {groupedProducts[category]?.map((product, index) => (
                                <ProductCard product={product} key={index} />
                            ))}
                        </div>
                    </div>
                ))}

                {groupedProducts[""]?.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-300 pb-2">
                            未分類商品
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {groupedProducts[""]?.map((product, index) => (
                                <ProductCard product={product} key={index} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}


export default Home;
