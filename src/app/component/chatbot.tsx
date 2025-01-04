import React from "react";
import Link from 'next/link';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Chatbot = () => {
  return (
    
    <Link href='/assistant'>
    <div
      className="fixed bottom-5 right-5 bg-[#9E8DC2] text-white p-4 rounded-full shadow-lg hover:bg-[#C9B9CC] cursor-pointer transition duration-300"
    >
        <FontAwesomeIcon icon={faRobot} size="2x" />
    </div>
    </Link> 
  );
};

export default Chatbot;