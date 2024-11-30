import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faUserRegular } from '@fortawesome/free-regular-svg-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import LoginPopup from './LoginPopup';
import { UserProfile } from '../model/userProfile';

function LoginButton() {
    const router = useRouter();
    const { id_token } = router.query;
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (token) {
            try {
                const decoded: UserProfile = jwtDecode(token);
                setProfile(decoded);
            } catch (error) {
                console.error("無效的 JWT:", error);
                localStorage.removeItem('access-token');
            }
        } else if (id_token) {
            try {
                const decoded: UserProfile = jwtDecode(`${id_token}`);
                setProfile(decoded);
                localStorage.setItem('access-token', `${id_token}`);
            } catch (error) {
                console.error("無效的 JWT:", error);
            }
        }
    }, [id_token]);

    useEffect(() => {
        document.body.style.overflow = isLoginOpen ? 'hidden' : 'auto';
    }, [isLoginOpen]);

    const handleLoginClick = () => {
        if (profile) {
            router.push('/user');
        } else {
            setLoginOpen(true);
        }
    };

    return (
        <div className="absolute top-6 right-8">
            <button
                onClick={handleLoginClick}
                className="flex items-center rounded-full hover:opacity-70"
                style={{ border: '2px solid #9F79EE' }}
            >
                { profile ? <img src={profile.picture} alt="Profile Picture" className="w-9 rounded-full" /> :
                    <FontAwesomeIcon icon={faUserRegular} className="text-2xl m-1.5" style={{ color: '#9F79EE' }} />
                }
            </button>

            {isLoginOpen &&
                <LoginPopup
                    onClose={() => setLoginOpen(false)} 
                />
            }
        </div>
    )
}

export default LoginButton;