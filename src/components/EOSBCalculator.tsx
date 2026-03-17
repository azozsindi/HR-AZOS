// src/components/EOSBCalculator.tsx
import React, { useState, useEffect } from "react";
import { Company } from "../types";

interface EOSBCalculatorProps {
  company: Company;
  onBack: () => void;
}

export const EOSBCalculator: React.FC<EOSBCalculatorProps> = ({ company, onBack }) => {
  const c = company.primaryColor;
  
  const [salary, setSalary] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("resignation"); // resignation, termination, expiry, death_disability
  
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    baseReward: number;
    finalReward: number;
    percentage: number;
  } | null>(null);

  const calculate = () => {
    if (!salary || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      alert("تاريخ النهاية يجب أن يكون بعد تاريخ البداية / End date must be after start date");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = (totalDays % 365) % 30;

    const decimalYears = totalDays / 365;
    
    // Base Reward Calculation (Article 84)
    let baseReward = 0;
    if (decimalYears <= 5) {
      baseReward = (salary / 2) * decimalYears;
    } else {
      baseReward = (salary / 2) * 5 + (salary * (decimalYears - 5));
    }

    // Adjustment based on reason (Article 85)
    let percentage = 1;
    if (reason === "resignation") {
      if (decimalYears < 2) {
        percentage = 0;
      } else if (decimalYears < 5) {
        percentage = 1 / 3;
      } else if (decimalYears < 10) {
        percentage = 2 / 3;
      } else {
        percentage = 1;
      }
    } else {
      // Termination, Expiry, Force Majeure, etc. usually 100%
      percentage = 1;
    }

    const finalReward = baseReward * percentage;

    setResult({
      years,
      months,
      days,
      totalDays,
      baseReward,
      finalReward,
      percentage
    });
  };

  useEffect(() => {
    if (salary && startDate && endDate) {
      calculate();
    }
  }, [salary, startDate, endDate, reason]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans antialiased pb-10" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 px-4 md:px-7 py-4 flex flex-col sm:flex-row items-center gap-4 shadow-md text-white" style={{ background: c }}>
        <button onClick={onBack} className="bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors self-start sm:self-auto">← رجوع</button>
        <h1 className="m-0 text-sm md:text-lg font-bold text-center sm:text-right">
          🧮 حاسبة مستحقات نهاية الخدمة 
          <span className="block sm:inline font-normal text-[10px] md:text-xs opacity-80 sm:mr-2">| EOSB Calculator</span>
        </h1>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
          <h3 className="m-0 mb-5 text-sm font-bold pb-2 border-b-2" style={{ color: "#333", borderColor: c + "22" }}>بيانات الموظف</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-gray-600">الراتب الفعلي (الأساسي + البدلات)</label>
              <input type="number" value={salary || ""} onChange={e => setSalary(parseFloat(e.target.value))} placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none transition-all"
                style={{ "--tw-ring-color": c + "44" } as any} />
              <span className="text-[9px] text-gray-400 mt-1 block uppercase tracking-tighter">Total Salary (Basic + Allowances)</span>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-gray-600">تاريخ بداية العمل</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none transition-all"
                style={{ "--tw-ring-color": c + "44" } as any} />
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-gray-600">تاريخ نهاية العمل</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none transition-all"
                style={{ "--tw-ring-color": c + "44" } as any} />
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-gray-600">سبب انتهاء العلاقة التعاقدية</label>
              <select value={reason} onChange={e => setReason(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none transition-all bg-white"
                style={{ "--tw-ring-color": c + "44" } as any}>
                <option value="resignation">استقالة الموظف (Resignation)</option>
                <option value="termination">إنهاء من صاحب العمل (Termination)</option>
                <option value="expiry">انتهاء مدة العقد (Contract Expiry)</option>
                <option value="force_majeure">قوة قاهرة (Force Majeure)</option>
                <option value="death_disability">وفاة أو عجز كلي (Death/Disability)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-gray-400 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
            💡 الحسابات مبنية على نظام العمل السعودي (المواد 84، 85).<br/>
            Calculations are based on Saudi Labor Law.
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="m-0 mb-6 text-sm font-bold text-gray-800 flex justify-between items-center">
            <span>النتائج التقديرية</span>
            <span className="text-[10px] text-gray-400 font-normal uppercase tracking-widest">Estimated Results</span>
          </h3>

          {!result ? (
            <div className="text-center py-20 text-gray-300">
              <div className="text-6xl mb-4 opacity-20">📊</div>
              <div className="text-sm font-bold">أدخل البيانات لعرض الحسابات</div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-2xl border transition-all" style={{ background: c + "08", borderColor: c + "15" }}>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">مدة الخدمة</div>
                  <div className="text-lg font-black text-gray-800">
                    {result.years} سنة، {result.months} شهر، {result.days} يوم
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{result.totalDays} يوم إجمالي</div>
                </div>
                <div className="p-5 rounded-2xl border transition-all" style={{ background: c + "08", borderColor: c + "15" }}>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">نسبة الاستحقاق</div>
                  <div className="text-2xl font-black" style={{ color: c }}>
                    {(result.percentage * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">بناءً على سبب انتهاء الخدمة</div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-right text-xs md:text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 text-gray-500">المكافأة الكاملة (100%)</td>
                      <td className="p-4 text-left font-bold text-gray-800">{result.baseReward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</td>
                    </tr>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <td className="p-4 text-gray-500">النسبة المستحقة</td>
                      <td className="p-4 text-left font-bold text-gray-800">× {(result.percentage * 100).toFixed(0)}%</td>
                    </tr>
                    <tr style={{ background: c + "10" }}>
                      <td className="p-5 font-black text-gray-800 text-sm md:text-base">صافي مكافأة نهاية الخدمة</td>
                      <td className="p-5 text-left font-black text-xl md:text-2xl" style={{ color: c }}>
                        {result.finalReward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
                <h4 className="m-0 mb-3 text-xs font-black text-amber-800 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> ملاحظات هامة:
                </h4>
                <ul className="m-0 pr-5 list-disc space-y-2 text-[10px] md:text-xs text-amber-800/80 leading-relaxed font-medium">
                  <li>هذه الحاسبة تقديرية فقط ولا تعتبر مستنداً قانونياً ملزماً.</li>
                  <li>تُحسب المكافأة على أساس آخر راتب تقاضاه الموظف (الراتب الفعلي).</li>
                  <li>في حال الاستقالة، لا يستحق الموظف مكافأة إذا كانت خدمته أقل من سنتين.</li>
                  <li>يستحق الموظف المكافأة كاملة في حالات الوفاة أو العجز أو القوة القاهرة بغض النظر عن مدة الخدمة.</li>
                </ul>
              </div>
              
              <div className="text-center">
                <button onClick={() => window.print()} className="bg-gray-100 border border-gray-200 px-8 py-3 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-200 transition-all active:scale-95">
                  🖨️ طباعة التقرير
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
