import LoginButton from './LoginButton';
import CartButton from './CartButton';
import Link from 'next/link';

const NavigationBar = () => {
  return (
    <nav className="flex justify-between items-center bg-[#C9B9CC] border-b border-gray-300 fixed w-full top-0 z-10 h-20">
      <div className="flex justify-center flex-1">
        <Link href="/" className="text-2xl text-[#68228B]">
          東毅中
        </Link>
      </div>
      <div className="flex space-x-4">
        <CartButton />
        <LoginButton />
      </div>
    </nav>
  );
};

export default NavigationBar;