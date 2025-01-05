import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faUserRegular } from '@fortawesome/free-regular-svg-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import LoginPopup from './LoginPopup';
import { UserProfile } from '../model/userProfile';
import Image from "next/image";
import OtpPopup from './OTPPopup';


function LoginButton() {
    const router = useRouter();
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [isAccountExisted, setIsAccountExisted] = useState(false);

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
        }
    }, []);

    useEffect(() => {
        if (profile) {
            fetchUser(profile.email, profile.name);
        }
    }, [profile]);
    
    const fetchUser = async (email: string, name: string) => {
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
                setIsAccountExisted(true);
            } else if (response.status === 404) {
                await createUser(email, name);
                setShowOtpPopup(true);
            } else {
                console.error('fetch user error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    };

    const createUser = async (email: string, name: string) => {
        const url = 'https://dongyi-api.hnd1.zeabur.app/user/account/otp-send';
        const request = {
            "id": `${email}`,
            "name": `${name}`,
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                console.error('error:', response.status);
            }
        } catch (err) {
            console.log(err);
            router.push('/');
        }
    };

    useEffect(() => {
        document.body.style.overflow = isLoginOpen ? 'hidden' : 'auto';
    }, [isLoginOpen]);

    const handleLoginClick = () => {
        if (profile && isAccountExisted) {
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
                { profile && isAccountExisted ? (
                    <Image
                        src={profile.picture} 
                        alt="Profile Picture"
                        width={36} 
                        height={36}
                        className="rounded-full" 
                    />) : 
                    <FontAwesomeIcon icon={faUserRegular} className="text-2xl m-1.5 text-[#9F79EE]" />
                }
            </button>

            {isLoginOpen &&
                <LoginPopup
                    onClose={() => setLoginOpen(false)} 
                />
            }
            {showOtpPopup && 
                <OtpPopup 
                    onClose={() => {
                        setShowOtpPopup(false);
                        localStorage.removeItem('access-token');
                    }} 
                />
            }
        </div>
    )
}

export default LoginButton;