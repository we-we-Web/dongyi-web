import { useEffect } from "react";
import { useState } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Image from 'next/image';
import 'react-lazy-load-image-component/src/effects/blur.css';

function ProductImageGallery({id, name, isIndex }: {id: string, name: string, isIndex: boolean,index:number}) {
    const [src, setSrc] = useState<string[]>([]);
    const [selectedImg, setSelectedImg] = useState<number>(0);
    useEffect(() => {
        const url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/get_image?product_id=${id}`;
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if(response.ok) {
                    const data = await response.json();
                    setSrc(data.image_urls);
                } else {
                    console.error('failed to fetch:', response.status);
                    setSrc(['https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif']);
                }
            } catch (error) {
                console.error('error:', error);
                setSrc(['https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif']);
            }
        };
        fetchData();
    }, [id]);
    const handleThumbnailClick = (index: number) => {
        setSelectedImg(index);
    };
    return (
        <div className="flex flex-col">
            <div className="mb-4">
                <LazyLoadImage
                    src={src && src.length > 0 ? src[selectedImg] : 'https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif'}
                    alt={name}
                    className={`object-cover w-full ${isIndex ? 'h-48' : 'h-[60vh] rounded-lg'}`}
                    effect="blur"
                    onError={() => setSrc(['https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif'])}
                />
            </div>
            {src.length > 1 && (
                <div className="flex space-x-2">
                    {src.map((image, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer border rounded-md ${
                                selectedImg === index ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index}`}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductImageGallery;