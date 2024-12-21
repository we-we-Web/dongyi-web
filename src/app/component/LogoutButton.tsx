import React from 'react';
import { useRouter } from 'next/router';

const LogoutButton: React.FC = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('access-token');
        router.push('/');
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition"
        >
            登出
        </button>
    );
};

export default LogoutButton;