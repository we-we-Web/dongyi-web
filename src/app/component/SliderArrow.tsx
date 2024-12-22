export const SliderPrevArrow = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            className="opacity-50 absolute left-[-30px] top-1/2 
                        transform -translate-y-1/2 z-10 bg-white text-gray-800 
                        p-3 rounded-full shadow-md border border-gray-300 
                        hover:bg-gray-100 hover:scale-110 transition-transform duration-300 ease-in-out"
            onClick={onClick}
        >
            ←
        </button>
    );
};

export const SliderNextArrow = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            className="opacity-50 absolute right-[-30px] top-1/2 
                        transform -translate-y-1/2 z-10 bg-white text-gray-800 
                        p-3 rounded-full shadow-md border border-gray-300 
                        hover:bg-gray-100 hover:scale-110 transition-transform duration-300 ease-in-out"
            onClick={onClick}
        >
            →
        </button>
    );
};