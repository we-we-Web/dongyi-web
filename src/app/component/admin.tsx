import Product from '../model/product';
import { GrEdit } from "react-icons/gr";
import Image from 'next/image';
import { useState } from 'react';
import '../../globals.css';

export default function admin({ product }: { product: Product}) {
    const [onEdit, setOnEdit] = useState(false);
    const [newProduct, setNewProduct] = useState<Product>(product);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [size, setSize] = useState<{ [key: string]: number }>({});
    const sizeOrder = ['S', 'M', 'L', 'XL'];
    const edit = () => {
        if (newProduct) {
            product = newProduct;
        }
        console.log(product);
        setOnEdit(!onEdit);
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const save = (type:string , value : string|number|{[key: string]: number}) => {
        if(!newProduct){
            setNewProduct({ id: '', name: '', price: 0, description: '', image: '', remain_amount: 0, color: '', size: '', discount: 0, categories: '', rating: 0 });
        }
        if (type === 'price' || type === 'remain_amount') {
            value = parseInt(value as string);
        }
        setNewProduct({ ...newProduct, [type]: value } as Product);
        if (newProduct) {
            product = { ...newProduct, id: newProduct.id ?? '', name: newProduct.name ?? '', price: newProduct.price ?? 0, description: newProduct.description ?? '', image: newProduct.image ?? '', remain_amount: newProduct.remain_amount ?? 0, color: newProduct.color ?? '', size: newProduct.size ?? '', discount: newProduct.discount ?? 0, categories: newProduct.categories ?? '', rating: newProduct.rating ?? 0 };
        }
        console.log(newProduct);
    }

    const sortDictionaryByKeys = (dict: { [key: string]: number }, order: string[]) => {
        const sortedEntries = Object.entries(dict).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
        return Object.fromEntries(sortedEntries);
    };

    const saveSize = (newSize:string) => {
        if (size.hasOwnProperty(newSize)) {
            const tmpSize = { ...size };
            delete tmpSize[newSize];
            setSize(tmpSize);
        } else {
            if(newProduct?.remain_amount){
                setSize({ ...size, [newSize]: newProduct?.remain_amount });
            }
            else{
                setSize({ ...size, [newSize]: 0 });
            }
        }
        sortDictionaryByKeys(size, sizeOrder);
        save('size', size);
        // console.log(size);
    }

    let url = '', method = '';
    if(product.id ==='-1'){
        url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/`;
        method = 'POST';
    }
    else {
        url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${product.id}`;
        method = 'PATCH';
    }

    const send = async() => {
        const request = {
            id: Number(newProduct.id),
            name: String(newProduct.name),
            price: Number(newProduct.price),
            size: newProduct.size,
            description: String(newProduct.description),
            categories: String(newProduct.categories),
            discount: Number(newProduct.discount),
            image_url: '',
        }
        console.log("request : ",request);
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if(response.ok){
                const result = await response.json();
                console.log(result);
                return;
            }
            else{
                console.log('failed to add product:', response.status);
            }
            if (selectedFile) {
                const formData = new FormData();
                console.log('Img:', selectedFile);
                formData.append('image', selectedFile);
                await sendImg(formData, newProduct.id ? product.id : newProduct.id);
            }
        } catch (err) {
            console.error('error:', err);
        }
    }

    const sendImg = async(newImg:FormData,id:string) => {
        url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/upload_image?product_id=${id}`;
        const request:FormData = newImg;
        console.log('request:', request.get('image'));
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                body: request,
            });
            if (response.ok) {
                const result = await response.json();
                alert('ProductImg added successfully');
                console.log(result);
                return;
            } else {
                console.log('Failed to upload image:', response.status);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }

    const Delete = async() => {
        const confirmed = confirm('Are you sure to delete this product?');
        if (confirmed) {
            url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${product.id}`;
            try{
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },

                });
                if(response.ok){
                    const result = await response.json();
                    console.log(result);
                    console.log('Product deleted successfully');
                    return;
                }
                else{
                    console.log('failed to add product:', response.status);
                }
            }
            catch(err){
                console.error('error:', err);
            }
        } else {
            console.log('Product deletion cancelled');
        }
    }


    return (
       <div className='flex m-8'>
            <button onClick={edit}><GrEdit /></button>
            {onEdit ? <input 
                        type='file' 
                        placeholder='new product Image' 
                        className='border border-gray-400' 
                        onChange={handleFileChange}/>
                        :
                <Image 
                    src={newProduct.image ?? "/default.png"}
                    className='mr-[5vw] border-gray-400 border object-contain'
                    alt={newProduct.name}
                    width={800}
                    height={800}
                    priority={true}
                />}
            <div className="flex-col pr-[10vw]">
                <div className="flex items-center">
                    <h3>product id : </h3>
                    {onEdit ? <div><input type='text' placeholder='new product id' className='border border-gray-400' onChange={(e) => save('id', e.target.value)}></input></div>:
                            <h1>{newProduct.id}</h1>}
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <div className="flex items-center">
                    {onEdit ? <input type='text' placeholder='new product name' className='border border-gray-400' onChange={(e) => save('name', e.target.value)}></input>:
                            <h1 className="text-[4em] font-bold">{newProduct.name}</h1>}
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <div className="flex items-center">
                    <div className="text-[3em] text-red-700 font-bold">
                        <span>
                        {onEdit ? <input type='text' placeholder='new product price' className='border border-gray-400' onChange={(e) => save('price', e.target.value)}></input> :
                        (newProduct.price * (1 - (newProduct.discount??1) / 100)).toFixed(2)}元</span>
                    </div> 
                    <button onClick={edit}><GrEdit /></button>
                </div>
                
                <div className="flex items-center">
                    {onEdit ? <input type='text' placeholder='new product description' className='border border-gray-400' onChange={(e) => save('description', e.target.value)}></input> :
                    newProduct.description}
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <div className="flex items-center">
                    <h3>product remain_amount : </h3>
                    {onEdit ? <input type='text' placeholder='new product remain_amount' className='border border-gray-400' onChange={(e) => save('remain_amount', e.target.value)}></input> :
                    newProduct.remain_amount}
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <div className="flex items-center">
                    <h3>product categories : </h3>
                    {onEdit ? <input type='text' placeholder='new product categories' className='border border-gray-400' onChange={(e) => save('categories', e.target.value)}></input> :
                    newProduct.categories}
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <div className="flex items-center">
                    <h3>product discount : </h3>
                    {onEdit ? <input type='text' placeholder='new product discount' className='border border-gray-400' onChange={(e) => save('discount', e.target.value)}></input> :
                    newProduct.discount}
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <div className="flex items-center">
                    <h3>product size : </h3>
                    {onEdit ? sizeOrder.map((item, index) => 
                    (<label key={index}>
                        <input 
                            type='checkbox' 
                            checked={size.hasOwnProperty(item)}
                            onChange={() => saveSize(item)} 
                        />
                        {item}
                    </label>)) : 
                    Object.entries(newProduct.size).map(([key, value]) => (
                        <span key={key}>{key}</span>
                    )) }
                    <button onClick={edit}><GrEdit /></button>
                </div>
                <span className='mt-4'>
                    <button 
                        className="bg-green-600 w-36 h-[2em] text-white hover:opacity-60 " 
                        onClick={() => send()}>
                        Save
                    </button>
                    <button 
                        className="bg-gray-500 w-36 h-[2em] text-white hover:opacity-60 ml-4"
                        onClick={Delete}>
                        Delete
                    </button>
                </span>
            </div>
        </div>
    );
};