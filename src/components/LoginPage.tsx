import React, { useState } from "react";
import { Company, UserAccount } from "../types";

interface LoginPageProps {
  company: Company;
  accounts: UserAccount[];
  onLogin: (account: UserAccount) => void;
}

import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { DEFAULT_COMPANY } from "../data";

export const LoginPage: React.FC<LoginPageProps> = ({ company, accounts, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      // Special check for Admin
      if (username === "azozsindi" && password === "24682468") {
        onLogin({
          id: "admin-id",
          username: "azozsindi",
          password: "24682468",
          role: "superadmin",
          companyData: company
        });
        return;
      }

      // Standard login for companies
      // First try to find by username in Firestore
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as UserAccount;
        if (userData.password === password) {
          onLogin({ ...userData, id: querySnapshot.docs[0].id });
          return;
        }
      }

      // Fallback to Firebase Auth if email is used
      if (username.includes("@")) {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const firebaseUser = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserAccount;
          onLogin({ ...userData, id: firebaseUser.uid });
          return;
        }
      }

      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    } catch (err: any) {
      console.error("Login error", err);
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    } finally {
      setIsLoading(false);
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
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-current focus:ring-0 transition-all outline-none text-sm font-bold"
                  style={{ color: platformColor }}
                />
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

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
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
