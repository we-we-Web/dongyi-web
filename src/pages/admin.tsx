import React, { useEffect, useState } from 'react';
import LogoutButton from '../app/component/LogoutButton';
import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '../app/model/userProfile';
import { useRouter } from 'next/router';
import Loading from '../app/component/Loading';
import Link from 'next/link';
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';
import { User } from '../app/model/userModel';
import moment from 'moment';

interface sampleOrder {
    id:string;
    status:string;
    owner:string;
    created_at:string;
}

function Admin() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState([]);
    const [created, setCreated] = useState<sampleOrder[]>([]);
    const [pending, setPending] = useState<sampleOrder[]>([]);
    const [delivery, setDelivery] = useState<sampleOrder[]>([]);
    const [completed, setCompleted] = useState<sampleOrder[]>([]);
    const [rejected, setRejected] = useState<sampleOrder[]>([]);
    const [draggedOrder, setDraggedOrder] = useState<sampleOrder>();
    const [loading, setLoading] = useState(true);
    
    const statusOrder = [created, pending, delivery, completed, rejected];
    const statusName = ['新訂單', '處理中', '運送中', '已完成', '已取消'];
    const statusValue = ['created', 'pending', 'delivery', 'completed', 'rejected'];
    const bgcolors = ['bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-red-400'];

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (token) {
            const decoded: UserProfile = jwtDecode(token);
            const email = decoded.email;
            try {
                fetchUser(decoded.email, decoded.name);
                let url = 'https://dongyi-api.hnd1.zeabur.app/order/api/orders-get';
                const request = {
                    "id": `${email}`,
                }
                const fetchOrders = async () => {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(request),
                    });
                    if(response.ok) {
                        const result = await response.json();
                        setOrders(result);
                    } else {
                        console.error('fetch order error:', response.status);
                    }
                };
                fetchOrders();
            } catch (error) {
                console.error("無效的 JWT:", error);
            }
        } else {
            router.push('/');
        }

    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if(!token) return;
        const decoded: UserProfile = jwtDecode(token);
        const email = decoded.email;
        orders.map((order) => {
            const url = 'https://dongyi-api.hnd1.zeabur.app/order/api/order-get';
            const request = {
                "id": `${order}`,
                "owner": `${email}`,
            }
            const fetchOrder = async () => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });
                if(response.ok) {
                    const result = await response.json();
                    // console.log(result.createdAt);
                    const order = {
                        id: result.id,
                        status: result.status,
                        owner: result.owner,
                        created_at: result.createdAt,
                    }
                    if(result.status == "created") {
                        setCreated(created => [...created, order]);
                    } else if(result.status == "pending") {
                        setPending(pending => [...pending, order]);
                    } else if(result.status == "delivery") {
                        setDelivery(delivery => [...delivery, order]);
                    } else if(result.status == "completed") {
                        setCompleted(completed => [...completed, order]);
                    } else if(result.status == "rejected") {
                        setRejected(rejected => [...rejected, order]);
                    }
                } else {
                    console.error('fetch order error:', response.status);
                }
            };
            fetchOrder();
        });
        setLoading(false);
    }, [orders]);

    const fetchUser = async(email: string, name: string) => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/user/account/account-get';
        const request = {
            "id": `${email}`,
        }
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
                setUser(result);
            } else {
                console.error('fetch user error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    };

    
    const formatDate = (dateString: string) => {
        const cleanedDateString = dateString.replace(/\[.*\]/, '');
        const date = moment(cleanedDateString, moment.ISO_8601);
        return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : 'Invalid date';
    };
    const handleDragStart = (order:sampleOrder) => {
        setDraggedOrder(order);
    };

    const handleDrop = (status:string) => {
        if (draggedOrder) {
            const updatedOrder = { ...draggedOrder, status };
            if (draggedOrder.status !== 'created' && status === 'created') {
                setCreated([...created, updatedOrder]);
                handleDropArray(draggedOrder.status,status);
            } else if (draggedOrder.status !== 'pending' && status === 'pending') {
                setPending([...pending, updatedOrder]);
                handleDropArray(draggedOrder.status,status);
            } else if (draggedOrder.status !== 'delivery' && status === 'delivery') {
                setDelivery([...delivery, updatedOrder]);
                handleDropArray(draggedOrder.status,status);
            } else if (draggedOrder.status !== 'completed' && status === 'completed') {
                setCompleted([...completed, updatedOrder]);
                handleDropArray(draggedOrder.status,status);
            }else if (draggedOrder.status !== 'rejected' && status === 'rejected') {
                setRejected([...rejected, updatedOrder]);
                handleDropArray(draggedOrder.status,status);
            }
            setDraggedOrder(undefined);
        }
    };

    const handleDropArray = (status:string,newStatus:string) => {
        if(draggedOrder){
            if(status === 'created') {
                setCreated(created.filter(order => order.id !== draggedOrder.id));
            }else if(status === 'pending') {
                setPending(pending.filter(order => order.id !== draggedOrder.id));
            }else if(status === 'delivery') {
                setDelivery(delivery.filter(order => order.id !== draggedOrder.id));
            }else if(status === 'completed') {
                setCompleted(completed.filter(order => order.id !== draggedOrder.id));
            } else if(status === 'rejected') {
                setRejected(rejected.filter(order => order.id !== draggedOrder.id));
            }
        }
        const fetchStatusUpdate = async () => {
            const url = 'https://dongyi-api.hnd1.zeabur.app/order/api/status-upd';
            const request = {
                id: draggedOrder?.id,
                admin: user?.id || '',
                status: newStatus,
            };
            console.log('fetch status update request:', request);
            try{
                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('fetch status update successfully:', result);
                }
                else{
                    console.error('fetch status update error:', response.status);
                }
            } catch (error) {
                console.error('fetch status update error:', error);
            }
        };
        fetchStatusUpdate();
    }

    if (loading) {
        return <Loading/>
    }

    return (
        <>
            <NavigationBar />
            <div className="text-right mt-6">
                <LogoutButton />
            </div>
            <div className="mt-10 flex justify-end px-10">
                <div className="flex space-x-2">
                    <button className="bg-purple-400 text-white py-2 px-4 rounded">訂單管理</button>
                    <button className="bg-purple-400 text-white py-2 px-4 rounded">
                        <Link href={{pathname: '/update', query: { id: -1 }}}>新增商品</Link>
                    </button>
                </div>
            </div>
            <div className="mt-4 px-6 mx-auto flex">
                <div className="w-screen h-screen">
                    <h1 className="text-4xl font-bold flex-grow text-center">訂單管理</h1>
                    <div className='flex space-x-4 mt-6 h-2/3 w-full'>
                        {statusOrder.map((order,index) => (
                            <div className={`w-1/5 shadow-md rounded-lg p-3 space-y-4 ${bgcolors[index]}`} key={index}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(statusValue[index])}>
                                <h1 className='text-3xl font-bold text-center'>{statusName[index]}</h1>
                                <div className='overflow-y-auto space-y-4 h-5/6'>
                                    {order.map((order,index) => (
                                        <div className="bg-white shadow-md rounded-lg p-3 h-52" key={index}
                                            draggable
                                            onDragStart={() => handleDragStart(order)}>
                                            <h1 className='text-lg font-bold'>訂單編號: {order.id}</h1>
                                            <h1 className='text-lg font-bold'>買家: </h1>
                                            <h1 className='text-lg font-bold'>{order.owner}</h1>
                                            <h1 className='text-lg font-bold'>訂單日期: {formatDate(order.created_at)}</h1>
                                            <Link href={`/order?id=${order.id}`}>
                                                <button className='bg-purple-400 text-white py-2 px-4 rounded'>查看訂單</button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;