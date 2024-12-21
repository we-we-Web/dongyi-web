import { GetServerSideProps } from 'next';
import ProductCard from '../app/component/ProductCard';
import { Product } from '../app/model/product';
import NavigationBar from '../app/component/NavigationBar';
import { useEffect, useState } from 'react';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../globals.css';
import Image from 'next/image';

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        const url = 'https://dongyi-api.hnd1.zeabur.app/product/api/product';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Product[] = await response.json();
        console.log('hello, ', data);
        return { props: { data } };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { props: { data: [] } };
    }
};

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700"
            onClick={onClick}
        >
            ←
        </button>
    );
};

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700"
            onClick={onClick}
        >
            →
        </button>
    );
};

const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
};

function Home({ data }: { data: Product[] }) {
    const [categories, setCategories] = useState<string[]>([]);
    const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({});

    useEffect(() => {
        const uniqueCategories = Array.from(
            new Set(data.map((product) => product.categories)
                    .filter(Boolean)
                    .filter((category): category is string => category !== undefined))
        );
        setCategories(uniqueCategories);

        const grouped = uniqueCategories.reduce((acc, category) => {
            acc[category] = data.filter((product) => product.categories === category);
            return acc;
        }, {} as Record<string, Product[]>);

        setGroupedProducts(grouped);
    }, [data]);

    return (
        <>
            <NavigationBar />
            <div className="mx-auto my-6 mt-32 max-w-screen-2xl">
                <Slider {...sliderSettings}>
                    <div className="h-[500px] flex items-center justify-center bg-gray-200">
                        <Image
                            src="https://i.imgur.com/7LxsGtY.jpeg"
                            alt="廣告 1"
                            width={1200}
                            height={300}
                            className="object-cover w-full h-full"
                            priority
                        />
                    </div>

                    <div className="h-[500px] flex items-center justify-center bg-gray-200">
                        <Image
                            src="https://i.imgur.com/FhSWoZt.png"
                            alt="廣告 2"
                            width={1200}
                            height={300}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div className="h-[500px] flex items-center justify-center bg-gray-200">
                        <Image
                            src="https://i.imgur.com/V4j3d7Y.jpeg"
                            alt="廣告 3"
                            width={1200}
                            height={300}
                            className="object-cover w-full h-full"
                        />
                    </div>
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
