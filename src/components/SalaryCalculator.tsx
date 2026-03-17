import React, { useState, useEffect } from "react";

interface SalaryCalculatorProps {
  company: any;
  onBack: () => void;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({ company, onBack }) => {
  const [basic, setBasic] = useState<number>(0);
  const [housing, setHousing] = useState<number>(0);
  const [transport, setTransport] = useState<number>(0);
  const [other, setOther] = useState<number>(0);
  const [saudi, setSaudi] = useState<boolean>(true);
  const [results, setResults] = useState<any>({});
  const c = company.primaryColor;

  useEffect(() => {
    const totalAllowances = housing + transport + other;
    const gross = basic + totalAllowances;
    
    // GOSI Calculation (Standard KSA)
    // Saudi: 9.75% (Employee) + 11.75% (Employer)
    // Non-Saudi: 2% (Employer only for Occupational Hazards)
    const gosiBase = basic + housing; // GOSI is calculated on Basic + Housing
    const gosiLimit = 45000;
    const cappedBase = Math.min(gosiBase, gosiLimit);
    
    const gosiEmployee = saudi ? (cappedBase * 0.0975) : 0;
    const gosiEmployer = saudi ? (cappedBase * 0.1175) : (cappedBase * 0.02);
    
    const net = gross - gosiEmployee;
    
    setResults({
      gross,
      gosiEmployee,
      gosiEmployer,
      net,
      totalCost: gross + gosiEmployer
    });
  }, [basic, housing, transport, other, saudi]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">💵</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">حاسبة الراتب الصافي (GOSI)</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Salary & GOSI Calculator (KSA)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-l border-gray-100">
            <h3 className="text-sm font-bold mb-5 pb-2 border-b-2" style={{ color: "#333", borderColor: c + "22" }}>بيانات الراتب</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold mb-2 text-gray-700">الجنسية</label>
              <div className="flex gap-2">
                <button onClick={() => setSaudi(true)} className={`flex-1 py-2 rounded-lg border-2 transition-all font-bold text-xs ${saudi ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: saudi ? c : undefined }}>🇸🇦 سعودي</button>
                <button onClick={() => setSaudi(false)} className={`flex-1 py-2 rounded-lg border-2 transition-all font-bold text-xs ${!saudi ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: !saudi ? c : undefined }}>🌍 مقيم</button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">الراتب الأساسي (Basic)</label>
                <input type="number" value={basic || ""} onChange={e => setBasic(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">بدل السكن (Housing)</label>
                <input type="number" value={housing || ""} onChange={e => setHousing(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">بدل النقل (Transport)</label>
                <input type="number" value={transport || ""} onChange={e => setTransport(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">بدلات أخرى (Other)</label>
                <input type="number" value={other || ""} onChange={e => setOther(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 mb-6 border-b-2 pb-2" style={{ borderColor: c + "22" }}>النتائج التقديرية</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-gray-500">إجمالي الراتب (Gross)</span>
                <span className="font-bold">{results.gross?.toLocaleString()} ريال</span>
              </div>

              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-gray-500">خصم التأمينات (GOSI Employee)</span>
                <span className="font-bold text-red-600">- {results.gosiEmployee?.toLocaleString()} ريال</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl text-center mb-6 shadow-sm border" style={{ background: c + "10", borderColor: c + "22" }}>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1" style={{ color: c }}>الراتب الصافي (Net Salary)</div>
              <div className="text-3xl font-black" style={{ color: c }}>{results.net?.toLocaleString()} <span className="text-sm">ريال</span></div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">تكلفة الموظف على الشركة (Total Cost)</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-gray-500">حصة الشركة في التأمينات</span>
                  <span className="font-bold">{results.gosiEmployer?.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between items-center text-sm md:text-base font-black pt-3 border-t border-gray-100">
                  <span className="text-gray-800">إجمالي التكلفة الشهري</span>
                  <span style={{ color: c }}>{results.totalCost?.toLocaleString()} ريال</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-[9px] md:text-[10px] text-gray-400 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 italic">
              * الحسابات مبنية على لوائح المؤسسة العامة للتأمينات الاجتماعية (GOSI) لعام 2024. الحد الأقصى للاشتراك هو 45,000 ريال.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
