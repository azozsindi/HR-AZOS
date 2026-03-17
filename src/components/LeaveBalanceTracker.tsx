import React, { useState, useEffect } from "react";

interface LeaveBalanceTrackerProps {
  company: any;
  onBack: () => void;
}

export const LeaveBalanceTracker: React.FC<LeaveBalanceTrackerProps> = ({ company, onBack }) => {
  const [joinDate, setJoinDate] = useState(new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0]);
  const [leavesTaken, setLeavesTaken] = useState<number>(0);
  const [results, setResults] = useState({
    totalEarned: 0,
    currentBalance: 0,
    yearsOfService: 0,
    ratePerYear: 21
  });

  const c = company.primaryColor;

  useEffect(() => {
    const start = new Date(joinDate);
    const now = new Date();
    
    // Calculate total days of service (including start and end date)
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const years = diffDays / 365.25;

    // Saudi Law: 21 days for first 5 years, 30 days after
    const rate = years >= 5 ? 30 : 21;
    const earned = (diffDays / 365.25) * rate;

    setResults({
      totalEarned: Math.floor(earned),
      currentBalance: Math.floor(earned - leavesTaken),
      yearsOfService: parseFloat(years.toFixed(2)),
      ratePerYear: rate
    });
  }, [joinDate, leavesTaken]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">🏖️</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">حاسبة رصيد الإجازات</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Leave Balance Tracker (Saudi Law)</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2 text-gray-700">تاريخ مباشرة العمل</label>
            <input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold mb-2 text-gray-700">أيام الإجازة المستهلكة سابقاً</label>
            <input type="number" value={leavesTaken} onChange={e => setLeavesTaken(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
          </div>

          <div className="bg-blue-50/50 border-2 border-dashed rounded-2xl p-6 md:p-8 text-center" style={{ borderColor: c + "22" }}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">سنوات الخدمة</div>
                <div className="font-bold text-sm md:text-base text-gray-800">{results.yearsOfService} سنة</div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">معدل الاستحقاق السنوي</div>
                <div className="font-bold text-sm md:text-base" style={{ color: c }}>{results.ratePerYear} يوم</div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2" style={{ color: c }}>رصيد الإجازات المتبقي "الآن"</div>
              <div className="text-4xl md:text-5xl font-black text-gray-900">{results.currentBalance} <span className="text-lg">يوم</span></div>
              <div className="text-[10px] md:text-xs text-gray-400 mt-2">إجمالي الرصيد المكتسب: {results.totalEarned} يوم</div>
            </div>
          </div>

          <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
            <strong className="text-gray-600">نظام العمل السعودي:</strong> يستحق العامل إجازة سنوية لا تقل مدتها عن 21 يوماً، وتزاد إلى مدة لا تقل عن 30 يوماً إذا أمضى العامل في خدمة صاحب العمل 5 سنوات متصلة.
          </div>
        </div>
      </div>
    </div>
  );
};
