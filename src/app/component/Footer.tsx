import React from 'react';

const Footer = () => {
    return (
        <footer className="py-8">
            <div className="container mx-auto text-center text-gray-600">
                {/* 使用 Tailwind 實現水平線效果 */}
                <hr className="border-b-1 border-gray-300 my-8" />
                
                <div className="flex justify-center space-x-6">
                    <a
                        href="https://github.com/we-we-Web/web-web-web"
                        className="hover:text-[#C9B9CC]"
                        target='_blank'
                    >
                        About
                    </a>
                    <a
                        href="https://github.com/we-we-Web"
                        className="hover:text-[#C9B9CC]"
                        target='_blank'
                    >
                        Services
                    </a>
                    <a
                        href="https://ateto1204.github.io"
                        className="hover:text-[#C9B9CC]"
                        target='_blank'
                    >
                        Contact
                    </a>
                </div>
                <p className="mt-6 text-sm">© 2020 東毅中. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
