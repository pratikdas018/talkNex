import React, { useContext, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import bg from "../assets/ROBO1.png";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      setUserData(result.data);
      navigate("/customize");
    } catch (error) {
      setUserData(null);
      setErr(error?.response?.data?.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[1.8rem] border border-[#9ad4ff45] bg-[#0b132799] shadow-[0_25px_70px_#00000070] lg:grid-cols-[1fr_1.08fr]">
        <form
          className="reveal-up order-2 flex min-h-[620px] flex-col justify-center gap-5 px-6 py-12 sm:px-10 lg:order-1"
          onSubmit={handleSignUp}
        >
          <div>
            <p className="mono text-xs uppercase tracking-[0.24em] text-[#9ac8f2]">
              New User Setup
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Create Your <span className="text-[#67f5d5]">TalkNEX</span> Hub
            </h2>
            <p className="mt-2 text-sm subtle">
              Build your AI assistant identity in less than a minute.
            </p>
          </div>

          <input
            type="text"
            placeholder="Your Name"
            className="field"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />

          <input
            type="email"
            placeholder="Email"
            className="field"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="field pr-12"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#b0c3dc]"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {err && <p className="rounded-xl bg-[#ff7f9f1c] px-3 py-2 text-sm text-[#ff9ab1]">{err}</p>}

          <button className="primary-btn mt-2 h-12 px-6" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <button
            type="button"
            className="ghost-btn h-11 px-5 text-sm"
            onClick={() => navigate("/signin")}
          >
            Already registered? Sign in
          </button>
        </form>

        <section
          className="order-1 relative hidden min-h-[620px] overflow-hidden p-10 lg:order-2 lg:block"
          style={{
            backgroundImage: `linear-gradient(180deg,#031022c4,#030f22d8),url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="floaty absolute left-8 top-8 rounded-full border border-[#96c8ff88] bg-[#5fa2e52d] px-4 py-2 text-sm font-semibold text-[#dcecff]">
            Personal AI Signature
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#040912] via-transparent to-transparent" />
          <div className="relative flex h-full flex-col justify-between">
            <h1 className="max-w-md text-5xl font-bold leading-tight text-[#eef7ff]">
              Design an assistant that sounds like your world.
            </h1>
            <p className="mono max-w-sm text-sm text-[#c4d7ed]">
              Name, style, and image come together in a unique voice workspace.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignUp;
