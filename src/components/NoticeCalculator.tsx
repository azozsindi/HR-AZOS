import React, { useState, useEffect } from "react";

interface NoticeCalculatorProps {
  company: any;
  onBack: () => void;
}

export const NoticeCalculator: React.FC<NoticeCalculatorProps> = ({ company, onBack }) => {
  const [resignationDate, setResignationDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractType, setContractType] = useState<"fixed" | "unlimited">("fixed");
  const [noticePeriod, setNoticePeriod] = useState<number>(30);
  const [lastWorkingDay, setLastWorkingDay] = useState("");

  const c = company.primaryColor;

  useEffect(() => {
    const date = new Date(resignationDate);
    date.setDate(date.getDate() + noticePeriod);
    setLastWorkingDay(date.toISOString().split('T')[0]);
  }, [resignationDate, noticePeriod]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">🚪</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">حاسبة فترة الإنذار</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Notice Period Calculator</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2 text-gray-700">تاريخ تقديم الاستقالة</label>
            <input type="date" value={resignationDate} onChange={e => setResignationDate(e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold mb-2 text-gray-700">نوع العقد</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => { setContractType("fixed"); setNoticePeriod(30); }} className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-xs ${contractType === "fixed" ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: contractType === "fixed" ? c : undefined }}>محدد المدة (غالباً 30 يوم)</button>
              <button onClick={() => { setContractType("unlimited"); setNoticePeriod(60); }} className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-xs ${contractType === "unlimited" ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: contractType === "unlimited" ? c : undefined }}>غير محدد المدة (غالباً 60 يوم)</button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold mb-2 text-gray-700">فترة الإنذار (بالأيام)</label>
            <input type="number" value={noticePeriod} onChange={e => setNoticePeriod(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
          </div>

          <div className="bg-red-50/50 border-2 border-dashed border-red-200 rounded-2xl p-6 md:p-8 text-center">
            <div className="text-[10px] md:text-xs text-red-600 font-bold uppercase tracking-widest mb-2">آخر يوم عمل متوقع</div>
            <div className="text-3xl md:text-4xl font-black text-gray-900">{lastWorkingDay}</div>
          </div>

          <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
            <strong className="text-gray-600">نظام العمل:</strong> في العقود غير محددة المدة، يجب أن تكون فترة الإنذار 60 يوماً على الأقل إذا كان العامل هو من ينهي العقد، و30 يوماً في العقود محددة المدة ما لم ينص العقد على غير ذلك.
          </div>
        </div>
      </div>
    </div>
  );
};
