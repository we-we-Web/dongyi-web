import Image from "next/image";
import { useState } from "react";


function ProductImage({id, name, isIndex}: {id: string, name: string, isIndex: boolean}) {
    const [src, setSrc] = useState(
        `https://dongyi-api.hnd1.zeabur.app/product/api/product/get_image?product_id=${id}`
    );
    return (
        <Image
            src={src}
            alt={name}
            width={1200} 
            height={1200}
            className={isIndex ? "w-full h-64 object-cover" : "w-auto h-[60vh] object-contain"}
            onError={() => setSrc('/default.png')}
        />
    )
}

export default ProductImage;