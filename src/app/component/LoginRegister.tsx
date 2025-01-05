import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaGoogle } from "react-icons/fa";

export default function LoginRegister({ onClose }: { onClose: () => void }) {
    const [authUrl, setAuthUrl] = useState<string | null>(null);

    useEffect(() => {
        axios.get('https://dongyi-api.hnd1.zeabur.app/user/auth/login', {
            withCredentials: true
        })
            .then((res) => setAuthUrl(res.data.auth_url))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <button
                className='border-2 border-purple-400 rounded-xl bg-purple-300 
                            shadow-xl p-2 m-3 hover:opacity-60'
            >
                <div className='flex px-2 text-white'>
                    <FaGoogle className='mr-2 mt-1' />
                    {authUrl ? (
                        <Link href={authUrl} onClick={onClose}>
                            Login with Google
                        </Link>
                    ) : (
                        "Login with Google"
                    )}
                </div>
            </button>
        </div>
    );
}
