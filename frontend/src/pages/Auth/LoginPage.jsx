import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { toast } from "react-hot-toast";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const {token, user} = await authService.login(email, password);
      login(user, token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to login. Please check your credentials.');
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);  
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-50">

      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email Field */}
            {/* <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide" >
                Email
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusField === 'email' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                  // className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:shadow-emerald-500/10"
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                  placeholder="your@example.com" 
                />
              </div>
            </div> */}

            <div className="space-y-2">
              <label className="block text-sx font-semibold text-slate-700 uppercase tracking-wide">
                Email
              </label>
              <div className="relative group">
                <div 
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 $
                focusField === 'email' 
                ? 'text-emerald-500' 
                : 'text-slate-400}`}
                >
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={()=> setFocusField("email")}
                onBlur={() => setFocusField(null)}
                autoComplete="off"
                className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field  */}
            {/* <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusField === 'password' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                  placeholder="........"
                />
              </div>
            </div> */}
            <div className="space-y-2">
                        <label className="block text-sx font-semibold text-slate-700 uppercase tracking-wide">
                          Password
                        </label>
                        <div className="relative group">
                          <div 
                          className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 $
                          focusField === 'password' 
                          ? 'text-emerald-500' 
                          : 'text-slate-400}`}
                          >
                            <Lock className="h-5 w-5" strokeWidth={2} />
                          </div>
                          <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={()=> setFocusField("password")}
                          onBlur={() => setFocusField(null)}
                          autoComplete="off"
                          className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                          placeholder="Enter your password"
                          />
                        </div>
                      </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                    </>
                    ): (
                    <>
                    Sign in
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                    </>
                    )}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        {/* Subtle footer text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>


//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">

//   <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[size:20px_20px]" />

//   <div className="w-full max-w-md relative z-10">
    
//     {/* Card */}
//     <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-3xl p-8">
      
//       {/* Header */}
//       <div className="text-center mb-8">
//         <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
//           <BrainCircuit className="w-8 h-8 text-white" strokeWidth={2} />
//         </div>

//         <h1 className="text-3xl font-bold text-slate-900 mb-2">
//           Welcome back
//         </h1>

//         <p className="text-slate-500 text-sm">
//           Sign in to continue your journey
//         </p>
//       </div>

//       {/* Form */}
//       <div className="space-y-5">

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">
//             Email
//           </label>

//           <div className="relative">
//             <div
//               className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-200 ${
//                 focusField === "email"
//                   ? "text-emerald-500"
//                   : "text-slate-400"
//               }`}
//             >
//               <Mail className="w-5 h-5" strokeWidth={2} />
//             </div>

//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onFocus={() => setFocusField("email")}
//               onBlur={() => setFocusField(null)}
//               className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
//               placeholder="your@example.com"
//             />
//           </div>
//         </div>

//         {/* Password */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">
//             Password
//           </label>

//           <div className="relative">
//             <div
//               className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-200 ${
//                 focusField === "password"
//                   ? "text-emerald-500"
//                   : "text-slate-400"
//               }`}
//             >
//               <Lock className="w-5 h-5" strokeWidth={2} />
//             </div>

//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onFocus={() => setFocusField("password")}
//               onBlur={() => setFocusField(null)}
//               className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
//               placeholder="••••••••"
//             />
//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
//             <p className="text-sm text-red-600 font-medium">
//               {error}
//             </p>
//           </div>
//         )}

//         {/* Button */}
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
//         >
//           <span className="flex items-center justify-center gap-2">
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Signing in...
//               </>
//             ) : (
//               <>
//                 Sign in
//                 <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
//               </>
//             )}
//           </span>
//         </button>
//       </div>

//       {/* Footer */}
//       <div className="mt-8 text-center">
//         <p className="text-sm text-slate-500">
//           Don't have an account?{" "}
//           <Link
//             to="/register"
//             className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>

//     {/* Bottom Text */}
//     <p className="text-center text-xs text-slate-400 mt-6">
//       By continuing, you agree to our Terms & Privacy Policy
//     </p>
//   </div>
// </div>

  )
}

export default LoginPage
