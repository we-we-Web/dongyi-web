import { GetServerSideProps } from 'next';
import ProductCard from '../app/component/ProductCard';
import { Product } from '../app/model/product';
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';
import { useEffect, useState } from 'react';

export const getServerSideProps: GetServerSideProps = async () => {
    console.log('hello world');
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

function Home({ data }: { data: Product[] }) {
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [filteredData, setFilteredData] = useState<Product[]>([]);

    useEffect(() => {
        setFilteredData(data);
        const uniqueCategories: string[] = Array.from(
            new Set(data.map((product) => 
                product.categories).filter((category): category is string => category !== undefined)
            )
        );
        setCategories(uniqueCategories);
    }, []);

    const handleCategorySearch = () => {
        if (selectedCategory === '') {
            setFilteredData(data);
        } else {
            const filtered = data.filter(
                (product) => product.categories === selectedCategory
            );
            setFilteredData(filtered);
        }
    };

    return (
        <>
            <NavigationBar />
            <div className="p-6 relative mt-16">
                <h1 className="text-2xl font-bold mb-6">商品列表</h1>

                <div className="mb-4 flex items-center">
                    <label htmlFor="categorySelect" className="mr-2 font-semibold">選擇類別:</label>
                    <select
                        id="categorySelect"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded p-2 w-[200px]"
                    >
                        <option value="">全部商品</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleCategorySearch}
                        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:opacity-80"
                    >
                        搜尋
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredData.map((product, index) => (
                        <ProductCard product={product} key={index} />
                    ))}
                </div>
            </div>
        </>
    );
};


export default Home;
