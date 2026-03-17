import React, { useState } from "react";
import { Company, UserAccount } from "../types";
import { Eye, EyeOff, LogOut, Plus, Building2, Trash2 } from "lucide-react";

interface LoginPageProps {
  company: Company;
  accounts: UserAccount[];
  onLogin: (account: UserAccount) => void;
}

import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { DEFAULT_COMPANY } from "../data";

export const LoginPage: React.FC<LoginPageProps> = ({ company, accounts, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fixed platform color for login page
  const platformColor = "#4F46E5"; // Indigo-600

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Convert username to email
      let email = username;
      if (!username.includes("@")) {
        if (username.toLowerCase() === "azozsindi") {
          email = "azozsindi23@gmail.com";
        } else {
          email = `${username}@hr-system.com`;
        }
      }

      // 2. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // 3. Fetch user profile from Firestore to confirm role and company
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserAccount;
        onLogin({ ...userData, id: firebaseUser.uid });
      } else {
        // Special case for superadmin if doc doesn't exist yet
        if (email.toLowerCase() === "azozsindi23@gmail.com") {
          const adminData: UserAccount = {
            id: firebaseUser.uid,
            username: "azozsindi",
            password: "",
            role: "superadmin",
            companyData: DEFAULT_COMPANY
          };
          await setDoc(doc(db, "users", firebaseUser.uid), adminData);
          onLogin(adminData);
        } else {
          throw new Error("User profile not found");
        }
      }
    } catch (err: any) {
      console.error("Login error", err);
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    } finally {
      setIsLoading(false);
    }
  };

  const [initLoading, setInitLoading] = useState(false);

  const handleInitializeAdmin = async () => {
    setInitLoading(true);
    setError("");
    try {
      const email = "azozsindi23@gmail.com";
      const pass = "24682468";
      
      let uid = "";
      try {
        // Try to create
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        if (authErr.code === "auth/email-already-in-use") {
          // If exists, try to sign in to get the UID and update the doc
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            uid = userCredential.user.uid;
          } catch (loginErr: any) {
            setError("الحساب موجود بكلمة مرور مختلفة. يرجى استخدام كلمة المرور الصحيحة أو إعادة تعيينها من Firebase.");
            setInitLoading(false);
            return;
          }
        } else {
          throw authErr;
        }
      }

      // Ensure the Firestore document exists with the correct role
      await setDoc(doc(db, "users", uid), {
        id: uid,
        username: "azozsindi",
        password: "", 
        role: "superadmin",
        companyData: DEFAULT_COMPANY
      }, { merge: true });

      alert("تم تهيئة حساب السوبر أدمن بنجاح! يمكنك الآن تسجيل الدخول.");
    } catch (err: any) {
      console.error("Initialization error", err);
      setError("فشل التهيئة: " + err.message);
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f5] flex items-center justify-center p-4 font-sans antialiased" style={{ direction: "rtl" }}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-10 text-center text-white relative" style={{ background: platformColor }}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-4xl mb-4">🏢</div>
            <h1 className="text-2xl font-black mb-1">منصة الموارد البشرية الذكية</h1>
            <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">نظام إدارة النماذج والعمليات</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-xl font-black text-gray-800 mb-6 text-center">تسجيل الدخول</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 mr-1">اسم المستخدم</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">👤</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  className="w-full pr-10 pl-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-current focus:ring-0 transition-all outline-none text-sm font-bold"
                  style={{ color: platformColor }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 mr-1">كلمة المرور</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-12 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-current focus:ring-0 transition-all outline-none text-sm font-bold"
                  style={{ color: platformColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black p-3 rounded-xl border border-red-100">
                ⚠️ {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ background: platformColor }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <span>دخول للمنصة ←</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-4">
            <button 
              type="button"
              onClick={handleInitializeAdmin}
              disabled={initLoading}
              className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              {initLoading ? "جاري التهيئة..." : "⚙️ تهيئة حساب السوبر أدمن (للمرة الأولى)"}
            </button>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              هذه المنصة مخصصة للموظفين المصرح لهم فقط.<br/>
              في حال واجهت مشكلة في الدخول، يرجى التواصل مع مدير النظام.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
