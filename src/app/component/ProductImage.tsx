import { useEffect } from "react";
import { useState } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function ProductImage({id, name, isIndex,index}: {id: string, name: string, isIndex: boolean,index:number}) {
    const [src, setSrc] = useState<string[]>([]);
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
    
    return (
        <LazyLoadImage
            src={src && src.length > 1 ? src[1] : 'https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif'}
            alt={name}
            className={`object-cover w-full ${isIndex ? 'h-48' : 'h-[60vh'}`}
            effect="blur"
            onError={() => setSrc(['https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif'])}
        />
    )
}

export default ProductImage;