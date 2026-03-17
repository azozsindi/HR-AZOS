import React, { useState, useEffect } from "react";

interface OvertimeCalculatorProps {
  company: any;
  onBack: () => void;
}

export const OvertimeCalculator: React.FC<OvertimeCalculatorProps> = ({ company, onBack }) => {
  const [salary, setSalary] = useState<number>(6000);
  const [hours, setHours] = useState<number>(10);
  const [monthlyHours, setMonthlyHours] = useState<176 | 240>(240);
  const [type, setType] = useState<"standard" | "holiday">("standard");
  const [result, setResult] = useState({
    hourlyRate: 0,
    overtimeRate: 0,
    totalAmount: 0
  });

  const c = company.primaryColor;

  useEffect(() => {
    // Saudi Labor Law: Hourly Rate = Salary / Monthly Working Hours
    const hourly = salary / monthlyHours;
    const multiplier = type === "standard" ? 1.5 : 1.5; // Law says 1.5x for all OT
    const otRate = hourly * multiplier;
    const total = otRate * hours;

    setResult({
      hourlyRate: hourly,
      overtimeRate: otRate,
      totalAmount: total
    });
  }, [salary, hours, type, monthlyHours]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">⏰</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">حاسبة العمل الإضافي</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Overtime Calculator (Saudi Law)</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2 text-gray-700">الراتب الإجمالي (الأساسي + البدلات الثابتة)</label>
            <input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold mb-2 text-gray-700">عدد ساعات العمل الإضافي</label>
              <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-gray-700">ساعات العمل الشهرية (المعيار)</label>
              <select value={monthlyHours} onChange={e => setMonthlyHours(Number(e.target.value) as any)} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-sm font-bold bg-white" style={{ "--tw-ring-color": c + "44" } as any}>
                <option value={240}>240 ساعة (48 ساعة أسبوعياً)</option>
                <option value={176}>176 ساعة (40 ساعة أسبوعياً)</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold mb-2 text-gray-700">نوع اليوم</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => setType("standard")} className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs ${type === "standard" ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: type === "standard" ? c : undefined }}>يوم عمل اعتيادي (1.5x)</button>
              <button onClick={() => setType("holiday")} className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs ${type === "holiday" ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: type === "holiday" ? c : undefined }}>يوم عيد / عطلة (1.5x+)</button>
            </div>
          </div>

          <div className="bg-blue-50/50 border-2 border-dashed rounded-2xl p-6 md:p-8 text-center" style={{ borderColor: c + "22" }}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">سعر الساعة الاعتيادي</div>
                <div className="font-bold text-sm md:text-base text-gray-800">{result.hourlyRate.toFixed(2)} ريال</div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">سعر ساعة الإضافي</div>
                <div className="font-bold text-sm md:text-base" style={{ color: c }}>{result.overtimeRate.toFixed(2)} ريال</div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2" style={{ color: c }}>إجمالي مستحق العمل الإضافي</div>
              <div className="text-4xl font-black text-gray-900">{result.totalAmount.toLocaleString()} <span className="text-lg">ريال</span></div>
            </div>
          </div>

          <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
            <strong className="text-gray-600">نظام العمل السعودي:</strong> تُحسب ساعة العمل الإضافي بأجر الساعة مضافاً إليه 50% من أجره الأساسي (أي 1.5 ساعة). جميع ساعات العمل التي تؤدى في أيام الأعياد والعطلات الرسمية تعتبر ساعات إضافية.
          </div>
        </div>
      </div>
    </div>
  );
};
