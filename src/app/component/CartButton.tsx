import { useEffect, useState } from "react";
import LoginPopup from "./LoginPopup";
import { UserProfile } from "../model/userProfile";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { TiShoppingCart } from "react-icons/ti";

function CartButton() {
    const router = useRouter();
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
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = isLoginOpen ? 'hidden' : 'auto';
    }, [isLoginOpen]);

    const handleLoginClick = () => {
        if (profile) {
            router.push('/cart');
        } else {
            setLoginOpen(true);
        }
    };

    return (
        <div className="absolute top-6 right-20">
            <button
                onClick={handleLoginClick}
                className="flex items-center p-1 rounded-full hover:opacity-70 text-white"
            >
                <TiShoppingCart size={35} />
            </button>
            {isLoginOpen &&
                <LoginPopup
                    onClose={() => setLoginOpen(false)} 
                />
            }
        </div>
    )
}

export default CartButton;