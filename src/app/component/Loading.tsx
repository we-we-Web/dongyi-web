import { useState, useEffect } from "react";

export default function Loading() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex justify-center items-center flex-col h-screen bg-white font-sans">
      {loading ? (
        <div className="text-center">
          <p className="text-[3rem] font-[BrushScriptMT,cursive] mb-5 text-purple-800">
            東 毅 中
          </p>
          <p className="text-[#9F79EE]">SINCE 2020</p>
        </div>
      ) : (
        <div className="text-[1.5rem] text-black">
          <h1>Complete!</h1>
        </div>
      )}
    </div>
  );
}
