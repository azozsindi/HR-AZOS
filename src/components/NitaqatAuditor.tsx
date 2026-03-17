import React, { useState, useEffect } from "react";

interface NitaqatAuditorProps {
  company: any;
  onBack: () => void;
}

export const NitaqatAuditor: React.FC<NitaqatAuditorProps> = ({ company, onBack }) => {
  const [saudis, setSaudis] = useState<number>(5);
  const [expats, setExpats] = useState<number>(10);
  const [results, setResults] = useState({
    percentage: 0,
    zone: "Red",
    color: "#e74c3c",
    label: "نطاق أحمر",
    nextZone: "Green",
    neededSaudis: 0
  });

  const c = company.primaryColor;

  useEffect(() => {
    const total = saudis + expats;
    const percentage = total > 0 ? (saudis / total) * 100 : 0;
    
    let zone = "Red";
    let color = "#e74c3c";
    let label = "نطاق أحمر";
    let needed = 0;

    // Simplified Nitaqat logic (General Small/Medium Enterprise)
    if (percentage >= 40) {
      zone = "Platinum";
      color = "#2c3e50";
      label = "نطاق بلاتيني";
    } else if (percentage >= 25) {
      zone = "Green High";
      color = "#27ae60";
      label = "نطاق أخضر مرتفع";
    } else if (percentage >= 15) {
      zone = "Green Mid";
      color = "#2ecc71";
      label = "نطاق أخضر متوسط";
    } else if (percentage >= 10) {
      zone = "Green Low";
      color = "#a29bfe";
      label = "نطاق أخضر منخفض";
    } else {
      zone = "Red";
      color = "#e74c3c";
      label = "نطاق أحمر";
      needed = Math.ceil((0.1 * total) - saudis);
    }

    setResults({
      percentage: parseFloat(percentage.toFixed(2)),
      zone,
      color,
      label,
      nextZone: percentage < 10 ? "Green Low" : "Platinum",
      neededSaudis: Math.max(0, needed)
    });
  }, [saudis, expats]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">🇸🇦</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">مدقق نطاقات وقوى</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Nitaqat & Qiwa Auditor Tool</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-bold mb-2 text-gray-700">عدد الموظفين السعوديين</label>
              <input type="number" value={saudis} onChange={e => setSaudis(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-gray-700">عدد الموظفين الوافدين</label>
              <input type="number" value={expats} onChange={e => setExpats(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>
          </div>

          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 md:p-10 text-center shadow-inner">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-2">نسبة التوطين الحالية</div>
            <div className="text-5xl md:text-6xl font-black mb-6" style={{ color: results.color }}>{results.percentage}%</div>
            
            <div className="inline-block px-8 py-3 rounded-full font-black text-sm md:text-lg shadow-lg transition-transform hover:scale-105" style={{ background: results.color, color: "#fff" }}>
              {results.label}
            </div>

            {results.neededSaudis > 0 && (
              <div className="mt-8 bg-red-50 p-4 rounded-xl border border-red-200 text-red-600 text-xs md:text-sm font-bold flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>تحتاج إلى توظيف <strong className="text-red-800 underline underline-offset-4">{results.neededSaudis}</strong> سعوديين إضافيين للخروج من النطاق الأحمر.</span>
              </div>
            )}
          </div>

          <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
            <strong className="text-gray-600">ملاحظة:</strong> هذا المدقق يعطي نتائج تقديرية بناءً على النسب العامة. قد تختلف النتائج الفعلية حسب حجم المنشأة ونوع النشاط المسجل في وزارة الموارد البشرية والتنمية الاجتماعية.
          </div>
        </div>
      </div>
    </div>
  );
};
