'use server'

import React, { useState,useEffect } from 'react';
import NavigationBar from '../app/component/NavigationBar';
import ProductImage from '../app/component/ProductImage';
import { GrEdit } from "react-icons/gr";
import {Product,ProductSpec} from '../app/model/product';
import { GetServerSideProps } from 'next';
import '../globals.css';
import { Input } from 'postcss';

export const getServerSideProps: GetServerSideProps = async(context) => {
    const ProductId = context.query!;
    if (ProductId.id === '-1') {
        const product: Product = { id: '-1', name: '', price: 0, description: '', size: {}, discount: 0, categories: '' };
        return { props: {product} };
    }
    try {
        let url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/${ProductId.id}`;
        let response = await fetch(url);
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

export default function Admin({ product }: { product: Product }) {
    const [onEdit, setOnEdit] = useState(false);
    const [newProduct, setNewProduct] = useState<Product>(product);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [size, setSize] = useState<{ [key: string]: number }>(product.size);
    const [remain_amount, setRemain_amount] = useState<number>(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    const sizeOrder = ['S', 'M', 'L', 'XL'];
    const edit = () => {
        if (newProduct) {
            product = newProduct;
        }
        // console.log(product);
        setOnEdit(!onEdit);
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const save = (type:string , value : string|number|ProductSpec) => {
        if(!newProduct){
            setNewProduct({ id: '', name: '', price: 0, description: '',size:{}, discount: 0, categories: '' });
        }
        if (type === 'price' || type === 'remain_amount') {
            value = parseInt(value as string);
        }
        setNewProduct({ ...newProduct, [type]: value } as Product);
        // console.log(newProduct);
    }

    const sortDictionaryByKeys = (dict: { [key: string]: number }, order: string[]) => {
        const sortedEntries = Object.entries(dict).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
        return Object.fromEntries(sortedEntries);
    };

    const handleSaveSize = () => {
        console.log('selectedSize:', selectedSize);
        console.log('remain_amount:', remain_amount);
        if (remain_amount === 0) {
            const tmpSize = { ...size };
            if (selectedSize) {
                delete tmpSize[selectedSize];
            }
            setSize(tmpSize);
        } else {
            if(remain_amount > 0 && selectedSize && newProduct.size.hasOwnProperty(selectedSize)){
                let tmpSize = { ...size };
                tmpSize[selectedSize] = remain_amount;
                console.log('tmpSize:', tmpSize);
                setSize(tmpSize);
                // setSize({ ...size, [newSize]: remain_amount });
            } else {
                if (selectedSize) {
                    let tmpSize = { ...size };
                    tmpSize[selectedSize] = remain_amount;
                    setSize(tmpSize);
                }
            }
        }
    }

    useEffect(() => {
        // 當 size 更新時執行這些操作
        sortDictionaryByKeys(size, sizeOrder);
        save('size', size);
        console.log('size:', size);
        setToast({ message: 'Size updated', type: 'success' });
        setTimeout(() => setToast(null), 3000);
    }, [size]);

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
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await sendImg(formData, newProduct.id ? product.id : newProduct.id);
            }
            if(response.ok){
                const result = await response.json();
                console.log(result);
                setToast({ message: 'updata successfully: '+ result, type: 'success' });
                setTimeout(() => setToast(null), 3000);
                return;
            }
            else{
                console.log('failed to add product:', response.status);
            }
        } catch (err) {
            console.error('error:', err);
        }
    }

    const sendImg = async (newImg: FormData, id: string) => {
        const url = `https://dongyi-api.hnd1.zeabur.app/product/api/product/upload_image?product_id=${id}`;
        console.log('url:', url);
        // for (let pair of newImg.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        // }
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                body: newImg,
            });
            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                console.log(result);
                return;
            } else {
                console.log('Failed to upload image:', response.status);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

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
        <div className="flex flex-col items-center bg-gray-50 min-h-screen py-10">
            <NavigationBar />
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full mt-20">
                <div className="flex flex-col md:flex-row md:space-x-8">
                    <div className="flex-1 rounded-lg border border-slate-300">
                        {onEdit ? 
                            ( <div>
                                <label>新圖片</label>
                                <input type='file' onChange={handleFileChange}/>
                             </div>):
                            (<ProductImage id={newProduct.id} name={newProduct.name} isIndex={false} index={0}/>)
                        }
                    </div>
                    <div className="flex-1 flex flex-col space-y-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {onEdit ?
                                (<textarea 
                                    placeholder = {newProduct.name} 
                                    className='border border-gray-400 h-16 w-full' 
                                    onChange={(e) => save('name', e.target.value)}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                ></textarea>) : 
                                (newProduct.name)
                            }
                        </h1>
                        
                        <p className="text-gray-600">
                            {onEdit ?
                                (<textarea 
                                    placeholder={newProduct.description} 
                                    className='border border-gray-400 h-16 w-full' 
                                    onChange={(e) => save('description', e.target.value)}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                ></textarea>) : 
                                (newProduct.description)
                            }</p>
                        
                        {onEdit ?
                            (<input type='text' 
                                placeholder={String(newProduct.price)} 
                                className='border border-gray-400' 
                                onChange={(e) => save('price', e.target.value)}></input>) : 
                            (<p className="text-lg font-semibold text-purple-600">${newProduct.price}</p>)
                        }

                        <div>
                            <h2 className="text-gray-700 font-semibold mb-2">Size:</h2>
                            <div className="flex space-x-2">
                                {(sizeOrder).map((size) => (
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
                                    Selected size: {selectedSize} (Stock: {newProduct.size[selectedSize] ? newProduct.size[selectedSize] : 0})
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            {onEdit ? selectedSize &&
                                (<div>
                                    <input type='text' 
                                        placeholder= {String(newProduct.size[selectedSize])}
                                        className='border border-gray-400 mr-2' 
                                        onChange={(e) => setRemain_amount(Number(e.target.value))}></input>
                                    <button onClick={() => handleSaveSize()}
                                            className='bg-green-600 w-36 h-[2em] text-white hover:opacity-60 ml-4'>comform</button>
                                </div>) : 
                                ('')
                            }
                            {/* <h2 className="text-gray-700 font-semibold">Quantity:</h2> */}
                            
                        </div>


                    </div>
                </div>
            </div>
            <span className='mt-4'>
                    <button 
                        className="bg-purple-600 w-36 h-[2em] text-white hover:opacity-60" 
                        onClick={edit}>
                        Edit
                    </button>
                    <button 
                        className="bg-green-600 w-36 h-[2em] text-white hover:opacity-60 ml-4" 
                        onClick={() => send()}>
                        Save
                    </button>
                    <button 
                        className="bg-gray-500 w-36 h-[2em] text-white hover:opacity-60 ml-4"
                        onClick={Delete}>
                        Delete
                    </button>
                </span>

            {toast && (
                <div
                    className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${
                        toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
