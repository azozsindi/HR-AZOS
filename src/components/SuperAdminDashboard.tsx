import React, { useState, useEffect } from "react";
import { UserAccount, Company } from "../types";
import { DEFAULT_COMPANY } from "../data/industries";
import { Eye, EyeOff } from "lucide-react";

interface SuperAdminDashboardProps {
  accounts: UserAccount[];
  onAddAccount: (account: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  onLogout: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  accounts, onAddAccount, onDeleteAccount, onLogout 
}) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("checking...");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`/api/health?t=${Date.now()}`);
        const serverHeader = res.headers.get("X-HR-Server");
        
        if (res.ok) {
          const data = await res.json();
          setApiStatus(`OK (Firebase: ${data.firebase ? "Connected" : "Disconnected"}) (Server: ${serverHeader || "Unknown"})`);
        } else {
          setApiStatus(`Error: ${res.status} ${res.statusText} (Server: ${serverHeader || "Unknown"})`);
        }
      } catch (err) {
        setApiStatus(`Failed to reach API: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    checkHealth();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newUsername || !newPassword || !companyName) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }

    if (accounts.find(a => a.username === newUsername)) {
      setError("اسم المستخدم موجود مسبقاً");
      return;
    }

    setIsLoading(true);
    try {
      const email = `${newUsername}@hr-system.com`;
      const apiUrl = "/api/admin/create-user";
      console.log(`Calling API: ${apiUrl} with data:`, { email, username: newUsername });
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: newPassword,
          username: newUsername,
          role: "company",
          companyData: {
            ...DEFAULT_COMPANY,
            name: companyName,
          }
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          throw new Error(err.error || "Failed to create account");
        } else {
          const text = await response.text();
          console.error("Non-JSON error response:", text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      
      onAddAccount({
        id: result.uid,
        username: newUsername,
        password: newPassword,
        role: "company",
        companyData: {
          ...DEFAULT_COMPANY,
          name: companyName,
        },
        companyId: result.uid
      });

      setNewUsername("");
      setNewPassword("");
      setCompanyName("");
      alert("تم إنشاء الحساب بنجاح");
    } catch (err: any) {
      setError("خطأ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;
    
    try {
      const response = await fetch(`/api/admin/delete-user/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          throw new Error(err.error || "Failed to delete account");
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      onDeleteAccount(id);
    } catch (err: any) {
      alert("خطأ: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans antialiased p-4 md:p-8" style={{ direction: "rtl" }}>
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-black text-gray-800">لوحة تحكم السوبر أدمن 👑</h1>
          <p className="text-xs text-gray-400 mt-1">أهلاً بك azozsindi، يمكنك إدارة حسابات الشركات من هنا</p>
          <p className="text-[10px] mt-1">
            حالة النظام: <span className={apiStatus.startsWith("OK") ? "text-green-600" : "text-red-600"}>{apiStatus}</span>
          </p>
        </div>
        <button onClick={onLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition-all">تسجيل الخروج</button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        {/* Create Account Form */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-xs">➕</span>
            إنشاء حساب شركة جديد
          </h2>
          
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 mr-1">اسم الشركة</label>
              <input 
                type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="مثال: شركة الحلول المتقدمة"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 mr-1">اسم المستخدم (Login)</label>
              <input 
                type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder="company_user"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 mr-1">كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && <div className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg">{error}</div>}

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "جاري الإنشاء..." : "إنشاء الحساب الآن"}
            </button>
          </form>
        </section>

        {/* Accounts List */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-xs">🏢</span>
            قائمة حسابات الشركات ({accounts.filter(a => a.role === "company").length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                  <th className="pb-4 pr-2">الشركة</th>
                  <th className="pb-4">اليوزر</th>
                  <th className="pb-4">الباسورد</th>
                  <th className="pb-4 text-left pl-2">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {accounts.filter(a => a.role === "company").map(acc => (
                  <tr key={acc.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pr-2">
                      <div className="text-xs font-black text-gray-800">{acc.companyData.name}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">ID: {acc.id}</div>
                    </td>
                    <td className="py-4 text-xs font-mono text-indigo-600 font-bold">{acc.username}</td>
                    <td className="py-4 text-xs font-mono text-gray-500">{acc.password}</td>
                    <td className="py-4 text-left pl-2">
                      <button 
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="حذف الحساب"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.filter(a => a.role === "company").length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-xs text-gray-400 italic">لا توجد حسابات شركات حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
