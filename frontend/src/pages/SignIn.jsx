import React, { useContext, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import bg from "../assets/authBg.png";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
      const { token, ...userPayload } = result.data || {};
      if (token) {
        localStorage.setItem("talknex_token", token);
      } else {
        localStorage.removeItem("talknex_token");
      }
      setUserData(userPayload);
      navigate("/");
    } catch (error) {
      setUserData(null);
      setErr(error?.response?.data?.message || error?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="relative z-10 grid w-full max-w-7xl overflow-hidden rounded-[1.8rem] border border-[#9ad4ff45] bg-[#0b132799] shadow-[0_25px_70px_#00000070] xl:grid-cols-[1.02fr_1fr]">
        <section
          className="relative hidden min-h-[640px] overflow-hidden px-8 py-9 xl:flex xl:flex-col"
          style={{
            backgroundImage: `linear-gradient(180deg,#0213289f,#081933cc),url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="floaty relative z-10 ml-auto w-fit rounded-full border border-[#86fff28a] bg-[#64e2c82b] px-4 py-2 text-sm font-semibold text-[#d9fff8]">
            Voice-First Workspace
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#040912] via-transparent to-transparent" />
          <div className="relative z-10 mt-8 flex h-full flex-col justify-between">
            <h1 className="max-w-lg text-[clamp(2.6rem,4.4vw,5.1rem)] font-bold leading-[1.05] text-[#eef7ff]">
              Speak once. Let your assistant execute.
            </h1>
            <p className="mono max-w-sm text-sm text-[#c4d7ed]">
              TalkNEX is your command center for voice + AI actions, designed to
              feel cinematic and fast.
            </p>
          </div>
        </section>

        <form
          className="reveal-up flex min-h-[560px] flex-col justify-center gap-4 px-5 py-8 sm:min-h-[600px] sm:gap-5 sm:px-8 sm:py-10 lg:px-10"
          onSubmit={handleSignIn}
        >
          <div>
            <p className="mono text-xs uppercase tracking-[0.24em] text-[#9ac8f2]">
              Welcome Back
            </p>
            <h2 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.1]">
              Sign In to <span className="text-[#67f5d5]">TalkNEX</span>
            </h2>
            <p className="mt-2 text-sm subtle">
              Resume your personalized voice assistant session.
            </p>
          </div>

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
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <button
            type="button"
            className="ghost-btn h-11 px-5 text-sm"
            onClick={() => navigate("/signup")}
          >
            Need an account? Create one
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
