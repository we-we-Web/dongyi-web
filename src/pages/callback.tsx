import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../app/component/Loading';

export default function Callback() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdToken = async () => {
            const { code } = router.query;

            if (!code || typeof code !== 'string') {
                setError("Authorization code not found.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.post("https://dongyi-api.hnd1.zeabur.app/user/auth/callback", {
                    code: code,
                });
                const { id_token } = response.data;

                localStorage.setItem('access-token', `${id_token}`);
                router.push('/');
            } catch (err) {
                console.error("Failed to authenticate:", err);
                setError("Failed to authenticate.");
            } finally {
                setLoading(false);
            }
        };

        fetchIdToken();
    }, [router.query]);

    if (loading) return <Loading/>;
    if (error) return <div>{error}</div>;
    return null;
}