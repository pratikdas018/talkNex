import React, { useContext, useMemo, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Customize2() {
  const { userData, backendImage, selectedImage, frontendImage, serverUrl, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const previewImage = useMemo(() => {
    if (selectedImage === "input") return frontendImage;
    return selectedImage;
  }, [selectedImage, frontendImage]);

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) return;
    setErr("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName.trim());
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }
      const token = localStorage.getItem("talknex_token");
      const result = await axios.post(`${serverUrl}/api/user/update`, formData, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      console.log(error);
      const apiMessage = error?.response?.data?.message || "Unable to launch assistant";
      if (apiMessage.toLowerCase().includes("token not found")) {
        localStorage.removeItem("talknex_token");
        setUserData(null);
        navigate("/signin");
        return;
      }
      setErr(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="glass-card relative z-10 grid w-full max-w-5xl gap-8 p-4 sm:p-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <button
            type="button"
            className="ghost-btn inline-flex h-10 w-10 items-center justify-center"
            onClick={() => navigate("/customize")}
          >
            <MdKeyboardBackspace className="text-xl" />
          </button>

          <p className="mono text-xs uppercase tracking-[0.24em] text-[#95c6f1]">Step 2 of 2</p>
          <h1 className="text-3xl font-bold leading-tight">
            Name your <span className="text-[#67f5d5]">AI assistant</span>
          </h1>
          <p className="text-sm subtle">
            Pick a memorable wake word. You will use this name in voice commands.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#84d2ff45] bg-[#09162bd8]">
            {previewImage ? (
              <img src={previewImage} alt="Assistant preview" className="h-[230px] w-full object-cover" />
            ) : (
              <div className="flex h-[230px] items-center justify-center text-sm subtle">No preview image selected</div>
            )}
          </div>
        </div>

        <div className="reveal-up flex flex-col justify-center gap-4">
          <label className="mono text-xs uppercase tracking-[0.2em] text-[#95c6f1]">Assistant Name</label>
          <input
            type="text"
            placeholder="e.g. Nova, Orion, Pulse"
            className="field"
            required
            onChange={(e) => setAssistantName(e.target.value)}
            value={assistantName}
          />
          <p className="text-sm subtle">
            Tip: keep it short and distinct so voice recognition catches it quickly.
          </p>
          {err && <p className="rounded-xl bg-[#ff7f9f1c] px-3 py-2 text-sm text-[#ff9ab1]">{err}</p>}

          <button
            className="primary-btn mt-3 h-12 px-8"
            disabled={loading || !assistantName.trim()}
            onClick={handleUpdateAssistant}
          >
            {loading ? "Creating Assistant..." : "Launch Assistant"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Customize2;
