import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

interface FavoriteButtonProps {
    productId: string;
    isFavorite: boolean;
    onToggleFavorite: (productId: string, newState: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId, isFavorite, onToggleFavorite }) => {
    const [isFavoriteLocal, setIsFavoriteLocal] = useState(isFavorite);
    const [hovered, setHovered] = useState(false);

    const handleToggleFavorite = () => {
        const newState = !isFavoriteLocal;
        setIsFavoriteLocal(newState);
        onToggleFavorite(productId, newState);
    };

    return (
        <button
            onClick={handleToggleFavorite}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="focus:outline-none"
        >
            <FontAwesomeIcon
                icon={isFavoriteLocal || hovered ? solidHeart : regularHeart}
                className={`text-2xl transition-colors ${
                    isFavoriteLocal || hovered ? 'text-red-500' : 'text-gray-400'
                } hover:scale-110 hover:text-red-500 transition-transform duration-200`}
            />
        </button>
    );
};

export default FavoriteButton;