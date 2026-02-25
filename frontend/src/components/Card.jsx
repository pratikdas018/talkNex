import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext";

function Card({ image }) {
  const { setBackendImage, setFrontendImage, selectedImage, setSelectedImage } =
    useContext(userDataContext);

  const isSelected = selectedImage === image;

  return (
    <button
      type="button"
      className={`group relative h-[158px] w-[92px] overflow-hidden rounded-2xl border transition-all duration-300 sm:h-[212px] sm:w-[130px] lg:h-[250px] lg:w-[150px] ${
        isSelected
          ? "border-[#7de7ff] shadow-[0_0_35px_#64e2c752]"
          : "border-[#8ab6ff48] hover:border-[#a9d8ffb7]"
      }`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img src={image} alt="Assistant choice" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030814d0] via-transparent to-transparent" />
      <span className={`mono absolute bottom-2 left-2 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
        isSelected
          ? "border-[#8ff2dfb0] bg-[#64e2c830] text-[#d7fff6]"
          : "border-[#9db6d067] bg-[#0b1830ad] text-[#ccdcf2]"
      }`}>
        {isSelected ? "Selected" : "Preset"}
      </span>
    </button>
  );
}

export default Card;
