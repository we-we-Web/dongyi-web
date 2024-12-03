import Link from "next/link";

function CartButton() {
    return (
        <div className="absolute top-6 right-20">
            <Link href="cart">
                <button
                    className="flex items-center p-1.5 rounded-full hover:opacity-70"
                    style={{ border: '2px solid #9F79EE', color: '#9F79EE' }}
                >
                    購物車
                </button>
            </Link>
        </div>
    )
}

export default CartButton;