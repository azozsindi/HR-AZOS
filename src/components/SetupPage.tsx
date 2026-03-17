// src/components/SetupPage.tsx
import React, { useState } from "react";
import { Company, Industry, Employee } from "../types";
import { INDUSTRIES } from "../data";

interface SetupPageProps {
  localCompany: Company;
  setLocalCompany: React.Dispatch<React.SetStateAction<Company>>;
  saved: boolean;
  onSave: (d: Company) => void;
  onBack: () => void;
  fileRef: React.RefObject<HTMLInputElement>;
  stampFileRef: React.RefObject<HTMLInputElement>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStampUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdatePassword: (p: string) => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({ 
  localCompany, setLocalCompany, saved, onSave, onBack, 
  fileRef, stampFileRef, handleLogoUpload, handleStampUpload,
  onUpdatePassword
}) => {
  const c = localCompany.primaryColor;
  const [newPass, setNewPass] = useState("");
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [empData, setEmpData] = useState<Partial<Employee>>({});

  const handleAddEmployee = () => {
    if (!empData.name) return;
    const newEmp: Employee = {
      id: editingEmp?.id || Date.now().toString(),
      name: empData.name || "",
      idNumber: empData.idNumber || "",
      jobTitle: empData.jobTitle || "",
      department: empData.department || "",
      salary: Number(empData.salary || 0),
      hireDate: empData.hireDate || "",
      nationality: empData.nationality || "",
    };

    setLocalCompany(prev => {
      const employees = prev.employees || [];
      if (editingEmp) {
        return { ...prev, employees: employees.map(e => e.id === editingEmp.id ? newEmp : e) };
      }
      return { ...prev, employees: [...employees, newEmp] };
    });

    setShowEmpForm(false);
    setEditingEmp(null);
    setEmpData({});
  };

  const deleteEmployee = (id: string) => {
    setLocalCompany(prev => ({
      ...prev,
      employees: (prev.employees || []).filter(e => e.id !== id)
    }));
  };

  const editEmployee = (emp: Employee) => {
    setEditingEmp(emp);
    setEmpData(emp);
    setShowEmpForm(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans antialiased pb-10" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 px-4 md:px-7 py-4 flex items-center gap-4 shadow-md text-white" style={{ background: c }}>
        <button onClick={onBack} className="bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">← رجوع</button>
        <h1 className="m-0 text-base md:text-lg font-bold">⚙️ إعدادات الشركة</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-6 md:mt-8">
        {/* Employee Management Section */}
        <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 text-sm md:text-base text-gray-800 font-bold flex items-center gap-2">
              <span>👥</span> إدارة الموظفين
              <span className="text-[10px] md:text-xs text-gray-400 font-normal">(اختياري)</span>
            </h3>
            <button 
              onClick={() => { setShowEmpForm(true); setEditingEmp(null); setEmpData({}); }}
              className="px-3 py-1.5 rounded-lg font-bold text-[10px] text-white transition-all hover:opacity-90"
              style={{ background: c }}
            >
              + إضافة موظف
            </button>
          </div>

          {showEmpForm && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <h4 className="text-xs font-bold mb-3 text-gray-700">{editingEmp ? "تعديل بيانات موظف" : "إضافة موظف جديد"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">اسم الموظف</label>
                  <input value={empData.name || ""} onChange={e => setEmpData(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">رقم الهوية / الإقامة</label>
                  <input value={empData.idNumber || ""} onChange={e => setEmpData(p => ({ ...p, idNumber: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">المسمى الوظيفي</label>
                  <input value={empData.jobTitle || ""} onChange={e => setEmpData(p => ({ ...p, jobTitle: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">القسم</label>
                  <input value={empData.department || ""} onChange={e => setEmpData(p => ({ ...p, department: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">الراتب الإجمالي</label>
                  <input type="number" value={empData.salary || ""} onChange={e => setEmpData(p => ({ ...p, salary: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">تاريخ الالتحاق</label>
                  <input type="date" value={empData.hireDate || ""} onChange={e => setEmpData(p => ({ ...p, hireDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500">الجنسية</label>
                  <input value={empData.nationality || ""} onChange={e => setEmpData(p => ({ ...p, nationality: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddEmployee} className="flex-1 py-2 rounded-lg font-bold text-xs text-white" style={{ background: c }}>
                  {editingEmp ? "حفظ التعديلات" : "إضافة"}
                </button>
                <button onClick={() => setShowEmpForm(false)} className="flex-1 py-2 rounded-lg font-bold text-xs text-gray-600 bg-gray-200">إلغاء</button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {localCompany.employees && localCompany.employees.length > 0 ? (
              localCompany.employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                  <div>
                    <div className="text-xs font-bold text-gray-800">{emp.name}</div>
                    <div className="text-[10px] text-gray-400">{emp.jobTitle} | {emp.department}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editEmployee(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">✏️</button>
                    <button onClick={() => deleteEmployee(emp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all">🗑️</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs">لا يوجد موظفين مضافين حالياً</div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm">
          <h3 className="m-0 mb-4 text-sm md:text-base text-gray-800 font-bold flex items-center gap-2">
            <span>🔑</span> أمان الحساب
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block mb-1.5 text-xs font-bold text-gray-600">تغيير كلمة المرور</label>
              <input 
                type="password" 
                value={newPass} 
                onChange={e => setNewPass(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none transition-all"
                style={{ "--tw-ring-color": c + "44" } as any} 
              />
            </div>
            <button 
              onClick={() => { if(newPass) { onUpdatePassword(newPass); setNewPass(""); } }}
              className="px-6 py-2 rounded-lg font-bold text-xs text-white transition-all hover:opacity-90" 
              style={{ background: c }}
            >
              تحديث كلمة المرور
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm">
          <h3 className="m-0 mb-4 text-sm md:text-base text-gray-800 font-bold flex items-center gap-2">
            <span>🏢</span> مجال الشركة 
            <span className="text-[10px] md:text-xs text-gray-400 font-normal">سيحدد النماذج المتاحة تلقائياً</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INDUSTRIES.map(ind => (
              <div key={ind.id} onClick={()=>setLocalCompany(p=>({...p,industry:ind.id,primaryColor:ind.color}))}
                className={`border-2 rounded-xl p-3 md:p-4 cursor-pointer transition-all ${localCompany.industry===ind.id ? 'border-current bg-current/5' : 'border-gray-100 bg-white'}`}
                style={{ color: localCompany.industry===ind.id ? ind.color : "#666" }}>
                <div className="text-2xl md:text-3xl mb-1 md:mb-2">{ind.icon}</div>
                <div className="text-xs md:text-sm font-bold mb-0.5">{ind.label}</div>
                <div className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider">{ind.labelEn}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm">
          <h3 className="m-0 mb-4 text-sm md:text-base text-gray-800 font-bold">📋 بيانات الشركة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[["name","اسم الشركة (عربي)","Arabic Name"],["nameEn","اسم الشركة (إنجليزي)","English Name"],["address","العنوان (عربي)","Address AR"],["addressEn","العنوان (إنجليزي)","Address EN"],["phone","رقم الهاتف","Phone"],["email","البريد الإلكتروني","Email"],["website","الموقع الإلكتروني","Website"],["tagline","الشعار (Tagline)","Tagline"],["crNumber","رقم السجل التجاري","CR Number"],["vatNumber","الرقم الضريبي","VAT Number"]].map(([key,label,sub])=>(
              <div key={key}>
                <label className="block mb-1.5 text-xs font-bold text-gray-600">
                  {label}
                  <span className="text-[10px] text-gray-400 font-normal mr-2">{sub}</span>
                </label>
                <input value={(localCompany as any)[key]||""} onChange={e=>setLocalCompany(p=>({...p,[key]:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none transition-all"
                  style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
            ))}
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-600">اللون الرئيسي</label>
              <div className="flex items-center gap-3">
                <input type="color" value={localCompany.primaryColor} onChange={e=>setLocalCompany(p=>({...p,primaryColor:e.target.value}))}
                  className="w-12 h-10 border-none cursor-pointer rounded-lg overflow-hidden" />
                <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ background: localCompany.primaryColor }} />
                <span className="text-[10px] md:text-xs text-gray-400 font-mono">{localCompany.primaryColor}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="block mb-3 text-xs font-bold text-gray-600">شعار الشركة (Logo)</label>
            <div className="flex items-center gap-4 flex-wrap">
              {localCompany.logo && <img src={localCompany.logo} className="h-14 rounded-xl border border-gray-100 p-2 bg-gray-50 object-contain" />}
              <button onClick={()=>fileRef.current?.click()} className="px-4 py-2 rounded-lg font-bold text-xs text-white transition-all hover:opacity-90" style={{ background: c }}>📁 رفع الشعار</button>
              {localCompany.logo && <button onClick={()=>setLocalCompany(p=>({...p,logo:null}))} className="px-4 py-2 rounded-lg font-bold text-xs text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">🗑️ حذف</button>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="m-0 mb-4 text-sm md:text-base text-gray-800 font-bold flex items-center gap-2">
            <span>🔏</span> إعدادات الختم 
            <span className="text-[10px] md:text-xs text-gray-400 font-normal">Stamp Settings</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              {mode:"digital", icon:"✅", label:"ختم رقمي", sub:"Digital Stamp"},
              {mode:"manual",  icon:"⭕", label:"مساحة ختم يدوي", sub:"Manual Stamp Space"},
              {mode:"none",    icon:"✍️", label:"توقيع فقط", sub:"Signature Only"},
            ].map((opt: any) => (
              <div key={opt.mode} onClick={()=>setLocalCompany(p=>({...p,stampMode:opt.mode}))}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${localCompany.stampMode===opt.mode ? 'border-current bg-current/5' : 'border-gray-100 bg-white'}`}
                style={{ color: localCompany.stampMode===opt.mode ? c : "#666" }}>
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="text-xs md:text-sm font-bold mb-0.5">{opt.label}</div>
                <div className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider">{opt.sub}</div>
              </div>
            ))}
          </div>

          {localCompany.stampMode === "digital" && (
            <div className="pt-6 border-t border-gray-100">
              <label className="block mb-4 text-xs font-bold text-gray-600">صورة الختم الرقمي <span className="text-[10px] text-gray-400 font-normal mr-2">— يُفضَّل PNG بخلفية شفافة</span></label>
              <div className="flex items-center gap-5 flex-wrap">
                {localCompany.stampImage && (
                  <div className="relative bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <img src={localCompany.stampImage} className="h-20 w-20 object-contain" />
                    <div className="text-[8px] text-gray-400 text-center mt-2 uppercase tracking-widest">معاينة</div>
                  </div>
                )}
                <button onClick={()=>stampFileRef.current?.click()} className="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all hover:opacity-90" style={{ background: c }}>📁 رفع صورة الختم</button>
                {localCompany.stampImage && <button onClick={()=>setLocalCompany(p=>({...p,stampImage:null}))} className="px-5 py-2.5 rounded-lg font-bold text-xs text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">🗑️ حذف</button>}
                <input ref={stampFileRef} type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
              </div>
            </div>
          )}

          {localCompany.stampMode === "manual" && (
            <div className="pt-5 border-t border-gray-100 flex items-center gap-5">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[9px] text-gray-300 text-center leading-tight">ختم<br/>Stamp</span>
              </div>
              <div className="text-[11px] md:text-xs text-gray-500 leading-relaxed">
                ستظهر دائرة فارغة منقطة في النماذج لوضع الختم اليدوي عليها بعد الطباعة.<br/>
                <span className="text-[10px] text-gray-400 italic">A dashed circle will appear on printed forms for physical stamping.</span>
              </div>
            </div>
          )}

          {localCompany.stampMode === "none" && (
            <div className="pt-5 border-t border-gray-100 text-[11px] md:text-xs text-gray-500 leading-relaxed">
              ✍️ النماذج ستحتوي على خطوط التوقيع فقط بدون أي مساحة للختم.<br/>
              <span className="text-[10px] text-gray-400 italic">Forms will contain signature lines only with no stamp area.</span>
            </div>
          )}
        </div>

        <button onClick={()=>onSave(localCompany)} className="w-full py-4 rounded-2xl border-none font-black text-sm md:text-base text-white shadow-lg transition-all active:scale-[0.98] hover:opacity-90" style={{ background: c }}>
          {saved ? "✅ تم الحفظ!" : "💾 حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
};
