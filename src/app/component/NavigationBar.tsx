import LoginButton from './LoginButton';
import CartButton from './CartButton';
import Link from 'next/link';


const NavigationBar = () => {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px', 
        backgroundColor: '#C9B9CC',
        borderBottom: '1px solid #eaeaea',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 10,
        height: '80px', 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
        <Link href="/" style={{ fontSize: '24px', color: '#68228B' }}>
          東毅中
        </Link>
      </div>
      <CartButton />
      <LoginButton />
    </nav>
  );
};

export default NavigationBar;
