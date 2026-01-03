import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../Redux/userSlice";
import { Eye, EyeClosed } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      console.log("Response:", data.message);

      if (data?.success) {
        const userData = {
          id: data.data._id,
          name: data.data.name,
          email: data.data.email,
          token: data.jwtToken,
          image: data.data.image,
        };
        dispatch(login(userData));
        navigate("/home");
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Error:", err);
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-6 py-12">
        <div
          className="
            w-full max-w-sm p-5 rounded-2xl
            border-2 border-white/15           
            bg-white/10                        
            shadow-xl shadow-black/20
            backdrop-blur-md
          "
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white">
              Login
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-100"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleOnChange}
                    placeholder="Enter valid email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-400 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-100"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-300 hover:text-blue-200"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="mt-2 flex">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleOnChange}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-l-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-400 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="
                    flex items-center justify-center
                    rounded-r-md
                    p-2
                    bg-white/5
                    text-gray-300
                    border border-white/10
                    transition-all duration-200
                    hover:bg-white/10 hover:text-white
                    active:scale-95
                    focus:outline-none focus:ring-1 focus:ring-blue-400
                  "
                    aria-label="Toggle password visibility"
                  >
                    {show ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg ? (
                <p className="text-sm text-rose-200">{errorMsg}</p>
              ) : null}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex w-full justify-center rounded-md
                    bg-blue-600 hover:bg-blue-500            /* CHANGED: button blue */
                    px-3 py-2 text-sm font-semibold text-white
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400  /* CHANGED: focus color */
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {loading ? "Signing in..." : "Sign in"}{" "}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-200">
              New here?{" "}
              <a
                href="/signup"
                className="font-semibold text-blue-200 hover:text-blue-100"
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
