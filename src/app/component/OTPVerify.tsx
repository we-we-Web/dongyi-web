import { useState } from 'react';

export default function OTPVerify({ onClose }: { onClose: () => void }) {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const url = 'https://dongyi-api.hnd1.zeabur.app/user/account/account-create';
        const request = {
            "otp": `${otp}`,
            "email": `${email}`,
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (response.status === 200) {
                const result = await response.json();
                setMessage('Account created successfully');
                onClose();
            } else {
                setMessage(`Error: ${response.status}`);
                console.error('create user error:', response.status);
            }
        } catch (err) {
            console.log(err);
            setMessage('An error occurred');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        OTP:
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className='border-2 border-purple-400 rounded-xl p-2 m-3'
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='border-2 border-purple-400 rounded-xl p-2 m-3'
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    className='border-2 border-purple-400 rounded-xl bg-purple-300 
                                shadow-xl p-2 m-3 hover:opacity-60'
                >
                    Verify OTP
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}