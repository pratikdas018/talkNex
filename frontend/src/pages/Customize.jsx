import React, { useContext, useRef } from "react";
import Card from "../components/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {
  const {
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  const navigate = useNavigate();
  const inputImage = useRef(null);

  const presets = [image1, image2, image3, image4, image5, image6, image7];

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="glass-card relative z-10 w-full max-w-6xl p-4 sm:p-8">
        <button
          type="button"
          className="ghost-btn mb-6 inline-flex h-10 w-10 items-center justify-center"
          onClick={() => navigate("/")}
        >
          <MdKeyboardBackspace className="text-xl" />
        </button>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="reveal-up">
            <p className="mono text-xs uppercase tracking-[0.24em] text-[#95c6f1]">Step 1 of 2</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Choose an <span className="text-[#67f5d5]">assistant avatar</span>
            </h1>
            <p className="mt-3 text-sm subtle">
              Select a cinematic preset or upload your own image. This identity appears on your voice home screen.
            </p>

            <div className="mt-6 rounded-2xl border border-[#84d2ff45] bg-[#0a172bd3] p-4">
              <p className="mono text-xs uppercase tracking-[0.2em] text-[#95c6f1]">Selection</p>
              <p className="mt-2 text-sm text-[#d8e7f8]">
                {selectedImage ? "Avatar selected, continue to naming." : "No avatar selected yet."}
              </p>
            </div>
          </aside>

          <section className="reveal-up space-y-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {presets.map((image) => (
                <Card key={image} image={image} />
              ))}

              <button
                type="button"
                className={`group relative flex h-[158px] w-[92px] items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 sm:h-[212px] sm:w-[130px] lg:h-[250px] lg:w-[150px] ${
                  selectedImage === "input"
                    ? "border-[#7de7ff] shadow-[0_0_35px_#64e2c752]"
                    : "border-[#8ab6ff48] hover:border-[#a9d8ffb7]"
                }`}
                onClick={() => {
                  inputImage.current?.click();
                  setSelectedImage("input");
                }}
              >
                {!frontendImage && (
                  <div className="flex flex-col items-center gap-2">
                    <RiImageAddLine className="text-2xl text-[#dbebff]" />
                    <span className="mono text-[10px] uppercase tracking-[0.18em] text-[#c5d7ec]">Upload</span>
                  </div>
                )}
                {frontendImage && (
                  <img src={frontendImage} alt="Custom assistant" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
              </button>
            </div>

            <input type="file" accept="image/*" ref={inputImage} hidden onChange={handleImage} />

            {selectedImage && (
              <button
                className="primary-btn h-12 px-8"
                onClick={() => navigate("/customize2")}
              >
                Continue to Name
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Customize;
