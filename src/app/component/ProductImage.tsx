import Image from "next/image";
import { useEffect } from "react";
import { use, useState } from "react";


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
                    setSrc(['/default.png']);
                }
            } catch (error) {
                console.error('error:', error);
                setSrc(['/default.png']);
            }
        };
        fetchData();
    }, []);
    console.log(id,src);
    return (
        <div>
            {isIndex ? '' 
            : (<Image
                // key={index}
                src={src ? src[1] : '/default.png'}
                alt={name}
                width={1200}
                height={1200}
                className={isIndex ? "w-full h-64 object-cover" : "w-auto h-[60vh] object-contain"}
                onError={() => setSrc(['/default.png'])}
            />) } 
            
        </div>
    )
}

export default ProductImage;