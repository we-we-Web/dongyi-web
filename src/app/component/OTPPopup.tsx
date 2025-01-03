import OTPVerify from "./OTPVerify";

function OTPverify({ onClose, setUser }: { onClose: () => void, setUser: (user: any) => void }) {
    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleClickOutside}>
            <div className="bg-white p-8 rounded-lg w-80 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">OTP 驗證</h2>
                <div className="my-4 text-center">
                    <OTPVerify onClose={onClose} setUser={setUser}/>
                </div>
                <button 
                    onClick={onClose} 
                    className="mt-2 text-gray-500 hover:text-gray-700 w-full text-center">
                    關閉
                </button>
            </div>
        </div>
    );
};

export default OTPverify;