// src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import { Company, Form } from "./types";
import { 
  INDUSTRIES, 
  DEFAULT_COMPANY, 
  ALL_FORMS, 
  CAT_LABELS 
} from "./data";
import { SetupPage } from "./components/SetupPage";
import { FormPage } from "./components/FormPage";
import { EOSBCalculator } from "./components/EOSBCalculator";
import { DateConverter } from "./components/DateConverter";
import { SalaryCalculator } from "./components/SalaryCalculator";
import { CTCCalculator } from "./components/CTCCalculator";
import { OvertimeCalculator } from "./components/OvertimeCalculator";
import { JDGenerator } from "./components/JDGenerator";
import { NoticeCalculator } from "./components/NoticeCalculator";
import { LeaveBalanceTracker } from "./components/LeaveBalanceTracker";
import { NitaqatAuditor } from "./components/NitaqatAuditor";
import { InterviewScorecard } from "./components/InterviewScorecard";
import { VATCalculator } from "./components/VATCalculator";
import { SmartAlerts } from "./components/SmartAlerts";
import { LoginPage } from "./components/LoginPage";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { UserAccount } from "./types";

import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, query, where } from "firebase/firestore";

export default function HRSystem() {
  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY);
  const [localCompany, setLocalCompany] = useState<Company>(DEFAULT_COMPANY);
  const [user, setUser] = useState<UserAccount | null>(null);
  
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const currentUser = user;
  const [page, setPage] = useState<"dashboard" | "setup" | "form" | "calculator" | "date" | "salary" | "ctc" | "overtime" | "jd" | "notice" | "leave_tracker" | "nitaqat" | "interview" | "vat" | "alerts">("dashboard");
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const stampFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Safety timeout: If Firebase takes too long, stop loading
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Firebase auth timed out, forcing login page");
        setLoading(false);
      }
    }, 5000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserAccount;
            setUser({ ...userData, id: firebaseUser.uid });

            if (userData.role === "company" && userData.companyId) {
              // Fetch company data
              const compDoc = await getDoc(doc(db, "companies", userData.companyId));
              if (compDoc.exists()) {
                const compData = compDoc.data() as Company;
                setCompany(compData);
                setLocalCompany(compData);
              }
            }
          } else {
            // Handle case where user exists in Auth but not in Firestore (e.g. first time admin)
            // For now, if it's the superadmin email, we can bootstrap
            if (firebaseUser.email?.toLowerCase() === "azozsindi23@gmail.com") {
               const adminData: UserAccount = {
                 id: firebaseUser.uid,
                 username: firebaseUser.displayName || "admin",
                 password: "", // Not needed for Firebase Auth
                 role: "superadmin",
                 companyData: DEFAULT_COMPANY
               };
               await setDoc(doc(db, "users", firebaseUser.uid), adminData);
               setUser(adminData);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    });
    return () => {
      unsubscribeAuth();
      clearTimeout(timer);
    };
  }, []);

  // Listen for accounts if superadmin
  useEffect(() => {
    if (user?.role === "superadmin") {
      const q = query(collection(db, "users"), where("role", "==", "company"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const accs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserAccount));
        setAccounts(accs);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogin = (account: UserAccount) => {
    // Firebase login is handled in LoginPage.tsx
    // This function might be redundant now but kept for compatibility if needed
    setUser(account);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setPage("dashboard");
  };

  const addAccount = async (acc: UserAccount) => {
    // This will be handled via a backend call or by the superadmin dashboard
    // For now, we'll just save the account info to Firestore
    // Note: This doesn't create the Firebase Auth user yet. 
    // In a real app, you'd use a Cloud Function or Admin SDK.
    await setDoc(doc(db, "users", acc.id), acc);
    if (acc.companyData) {
      await setDoc(doc(db, "companies", acc.id), acc.companyData);
    }
  };

  const deleteAccount = async (id: string) => {
    // Delete from Firestore (Auth user deletion requires Admin SDK)
    // await deleteDoc(doc(db, "users", id));
  };

  const updatePassword = (newPass: string) => {
    if (!currentUser || currentUser.role !== "company" || currentUser.id === "guest") {
      alert("يجب تسجيل الدخول لتغيير كلمة المرور");
      return;
    }
    
    const updatedUser = { ...currentUser, password: newPass };
    setUser(updatedUser);
    localStorage.setItem("hr-user-session", JSON.stringify(updatedUser));

    const updatedAccounts = accounts.map(a => a.id === currentUser.id ? updatedUser : a);
    setAccounts(updatedAccounts);
    localStorage.setItem("hr-accounts", JSON.stringify(updatedAccounts));
    
    alert("تم تغيير كلمة المرور بنجاح");
  };

  useEffect(() => {
    const updateAlertCount = () => {
      const saved = localStorage.getItem("hr-docs-alerts");
      if (saved) {
        try {
          const docs = JSON.parse(saved);
          const today = new Date("2026-03-02"); // Consistent with SmartAlerts.tsx
          const count = docs.filter((doc: any) => {
            const expiry = new Date(doc.expiryDate);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 90 && diffDays > 0;
          }).length;
          setAlertCount(count);
        } catch (e) {
          setAlertCount(0);
        }
      } else {
        setAlertCount(0);
      }
    };
    updateAlertCount();
  }, [page]);

  useEffect(() => {
    if (page === "setup") setLocalCompany({ ...company });
  }, [page, company]);

  const saveCompany = async (d: Company) => {
    setCompany(d);
    if (currentUser && currentUser.role === "company" && currentUser.companyId && currentUser.id !== "guest") {
      try {
        await setDoc(doc(db, "companies", currentUser.companyId), d);
        
        const updatedUser = { ...currentUser, companyData: d };
        setUser(updatedUser);
        await setDoc(doc(db, "users", currentUser.id), updatedUser);
      } catch (e) {
        console.error("Failed to save company settings to Firebase", e);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setPage("dashboard");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      if (ev.target?.result) {
        setLocalCompany(p => ({ ...p, logo: ev.target!.result as string }));
      }
    };
    r.readAsDataURL(f);
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      if (ev.target?.result) {
        setLocalCompany(p => ({ ...p, stampImage: ev.target!.result as string }));
      }
    };
    r.readAsDataURL(f);
  };

  const visibleForms = ALL_FORMS.filter(f => 
    f.industries.includes("general") || f.industries.includes(company.industry)
  );
  const industryInfo = INDUSTRIES.find(i => i.id === company.industry) || INDUSTRIES[0];
  const c = company.primaryColor;

  const formsByCategory: Record<string, Form[]> = {};
  visibleForms.forEach(f => {
    if (!formsByCategory[f.cat]) formsByCategory[f.cat] = [];
    formsByCategory[f.cat].push(f);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f0f5] font-sans" style={{ direction: "rtl" }}>
        <div className="text-center animate-bounce">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-sm md:text-base font-black tracking-widest uppercase" style={{ color: c }}>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage company={company} accounts={accounts} onLogin={handleLogin} />;
  }

  if (user.role === "superadmin") {
    return <SuperAdminDashboard accounts={accounts} onAddAccount={addAccount} onDeleteAccount={deleteAccount} onLogout={handleLogout} />;
  }

  if (page === "setup") {
    return (
      <SetupPage 
        localCompany={localCompany} 
        setLocalCompany={setLocalCompany} 
        saved={saved} 
        onSave={saveCompany} 
        onBack={() => setPage("dashboard")} 
        fileRef={fileRef} 
        stampFileRef={stampFileRef} 
        handleLogoUpload={handleLogoUpload} 
        handleStampUpload={handleStampUpload} 
        onUpdatePassword={updatePassword}
      />
    );
  }

  if (page === "form" && activeForm) {
    return (
      <FormPage 
        activeForm={activeForm} 
        formData={formData} 
        setFormData={setFormData} 
        company={company} 
        onBack={() => { setPage("dashboard"); setFormData({}); }} 
      />
    );
  }

  if (page === "calculator") {
    return (
      <EOSBCalculator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "date") {
    return (
      <DateConverter 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "salary") {
    return (
      <SalaryCalculator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "ctc") {
    return (
      <CTCCalculator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "overtime") {
    return (
      <OvertimeCalculator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "jd") {
    return (
      <JDGenerator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "notice") {
    return (
      <NoticeCalculator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "leave_tracker") {
    return (
      <LeaveBalanceTracker 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "nitaqat") {
    return (
      <NitaqatAuditor 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "interview") {
    return (
      <InterviewScorecard 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "vat") {
    return (
      <VATCalculator 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  if (page === "alerts") {
    return (
      <SmartAlerts 
        company={company} 
        onBack={() => setPage("dashboard")} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-sans antialiased" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 px-4 md:px-7 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md" style={{ background: c, color: "#fff" }}>
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          {company.logo ? (
            <img src={company.logo} className="h-8 md:h-10 object-contain brightness-0 invert" alt="Logo" />
          ) : (
            <div className="text-lg md:text-xl font-black tracking-tighter">{company.nameEn || company.name}</div>
          )}
          <div className="border-r border-white/20 pr-3 md:pr-4">
            <div className="font-black text-sm md:text-base leading-tight">{company.name}</div>
            <div className="text-[9px] md:text-[10px] opacity-70 tracking-widest uppercase font-medium">{company.tagline}</div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-2 border border-white/5">
            <span>{industryInfo.icon}</span>
            <span className="hidden xs:inline">{industryInfo.label}</span>
            <span className="opacity-50 text-[8px] md:text-[9px]">({visibleForms.length})</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <div onClick={() => setPage("alerts")} className="relative cursor-pointer bg-white/15 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/25 transition-all active:scale-90 group">
              <span className="text-lg md:text-xl group-hover:rotate-12 transition-transform">🔔</span>
              {alertCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] md:text-[10px] font-black w-5 h-5 md:w-5.5 md:h-5.5 rounded-full flex items-center justify-center border-2 shadow-lg animate-pulse" style={{ borderColor: c }}>
                  {alertCount}
                </div>
              )}
            </div>

            <button onClick={() => setPage("setup")} className="bg-white text-gray-900 px-4 md:px-5 py-2 md:py-2.5 rounded-xl cursor-pointer text-[11px] md:text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-all active:scale-95">⚙️ الإعدادات</button>
            {user && (
              <button onClick={handleLogout} className="bg-red-500/20 border border-red-500/30 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl cursor-pointer text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-red-500/30 transition-all active:scale-95" title="تسجيل الخروج">🚪 خروج</button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="bg-white rounded-xl p-3 md:p-4 flex flex-wrap gap-3 md:gap-6 items-center mb-6 shadow-sm text-[10px] md:text-xs text-gray-500 border border-gray-100">
          <span className="flex items-center gap-1.5"><span className="opacity-70">📍</span> {company.address}</span>
          <span className="flex items-center gap-1.5"><span className="opacity-70">📞</span> {company.phone}</span>
          <span className="flex items-center gap-1.5"><span className="opacity-70">✉️</span> {company.email}</span>
          <span className="flex items-center gap-1.5"><span className="opacity-70">🌐</span> {company.website}</span>
          <span className="mr-auto font-black text-[9px] md:text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter" style={{ color: c, background: c + "15" }}>✅ ثنائي اللغة · لترهيد تلقائي</span>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 font-bold text-center text-xs md:text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
            ✅ تم حفظ إعدادات الشركة — النماذج تحديثت تلقائياً
          </div>
        )}

        {/* Tools Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6 border-r-4 pr-3" style={{ borderColor: c }}>
            <span className="text-2xl">🛠️</span>
            <h3 className="m-0 text-base md:text-lg text-gray-900 font-black uppercase tracking-tight">أدوات مساعدة</h3>
            <span className="text-[10px] md:text-xs text-gray-400 font-medium">Helper Tools</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <div onClick={() => setPage("calculator")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 group"
              style={{ background: `linear-gradient(135deg, ${c}, ${c}dd)` }}>
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">🧮</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة مستحقات نهاية الخدمة</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">EOSB Calculator (KSA Law)</div>
              </div>
            </div>

            <div onClick={() => setPage("date")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#457B9D] to-[#1D3557] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">📅</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">محول التاريخ الذكي</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Date Converter (Hijri/Greg)</div>
              </div>
            </div>

            <div onClick={() => setPage("salary")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#10B981] to-[#059669] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">💵</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة الراتب الصافي (GOSI)</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Net Salary & GOSI Calc</div>
              </div>
            </div>

            <div onClick={() => setPage("ctc")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#F59E0B] to-[#D97706] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">🏢</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة تكلفة الموظف (CTC)</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Total Cost to Company</div>
              </div>
            </div>

            <div onClick={() => setPage("overtime")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#EF4444] to-[#B91C1C] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">⏰</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة العمل الإضافي</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Overtime Calc (1.5x)</div>
              </div>
            </div>

            <div onClick={() => setPage("jd")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#6366F1] to-[#4338CA] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">✍️</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">مولد الوصف الوظيفي</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">JD Generator Tool</div>
              </div>
            </div>

            <div onClick={() => setPage("leave_tracker")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#EC4899] to-[#BE185D] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">🏖️</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة رصيد الإجازات</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Leave Balance Tracker</div>
              </div>
            </div>

            <div onClick={() => setPage("nitaqat")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#065F46] to-[#064E3B] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">🇸🇦</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">مدقق نطاقات وقوى</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Nitaqat & Qiwa Auditor</div>
              </div>
            </div>

            <div onClick={() => setPage("notice")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#6B7280] to-[#374151] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">🚪</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة فترات الإنذار</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Notice Period Calc</div>
              </div>
            </div>

            <div onClick={() => setPage("interview")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">📋</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">منظم المقابلات</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Interview Scorecard</div>
              </div>
            </div>

            <div onClick={() => setPage("vat")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] group">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">🧾</div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">حاسبة ضريبة القيمة المضافة</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">VAT Calculator (15%)</div>
              </div>
            </div>

            <div onClick={() => setPage("alerts")}
              className="rounded-2xl p-6 cursor-pointer shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 flex items-center gap-4 bg-gradient-to-br from-[#F43F5E] to-[#E11D48] group">
              <div className="relative shrink-0">
                <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">🔔</div>
                {alertCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-white text-[#F43F5E] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    {alertCount}
                  </div>
                )}
              </div>
              <div>
                <div className="font-black text-sm md:text-base mb-1">نظام التنبيهات الذكية</div>
                <div className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider font-medium">Smart Expiry Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {Object.entries(formsByCategory).map(([cat, forms]) => {
          const cl = CAT_LABELS[cat];
          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-r-4 pr-3 transition-all" style={{ borderColor: c }}>
                <span className="text-2xl">{cl?.icon}</span>
                <h3 className="m-0 text-base md:text-lg text-gray-900 font-black uppercase tracking-tight">{cl?.ar}</h3>
                <span className="text-[10px] md:text-xs text-gray-400 font-medium">{cl?.en}</span>
                <span className="mr-auto text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter" style={{ color: c, background: c + "15" }}>{forms.length} نماذج</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {forms.map(f => (
                  <div key={f.id} onClick={() => { setActiveForm(f.id); setFormData({}); setPage("form"); }}
                    className="bg-white rounded-2xl p-4 md:p-5 cursor-pointer shadow-sm border-2 border-transparent transition-all hover:scale-[1.05] hover:shadow-xl hover:border-current group"
                    style={{ color: c }}>
                    <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                    <div className="font-black text-[11px] md:text-xs text-gray-900 mb-1 leading-tight">{f.title}</div>
                    <div className="text-[9px] md:text-[10px] text-gray-400 mb-3 leading-tight font-medium">{f.titleEn}</div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: c }}>
                      <span>فتح</span>
                      <span>←</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-dashed text-center text-[10px] md:text-xs text-gray-500 leading-relaxed shadow-inner" style={{ borderColor: c + "22" }}>
          <strong className="text-sm block mb-1" style={{ color: c }}>💡 نصيحة ذكية</strong>
          غيّر مجال الشركة من الإعدادات لتظهر نماذج متخصصة إضافية. كل النماذج تُطبع باللغتين العربية والإنجليزية مع لترهيد شركتك تلقائياً.
        </div>
      </div>
    </div>
  );
}
