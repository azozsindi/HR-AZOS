import React, { useState, useEffect } from "react";
import moment from "moment-hijri";

interface DateConverterProps {
  company: any;
  onBack: () => void;
}

export const DateConverter: React.FC<DateConverterProps> = ({ company, onBack }) => {
  const [mode, setMode] = useState<"GtoH" | "HtoG">("GtoH");
  const [gregorian, setGregorian] = useState(new Date().toISOString().split('T')[0]);
  const [hijriDate, setHijriDate] = useState({
    day: moment().iDate(),
    month: moment().iMonth() + 1,
    year: moment().iYear()
  });
  const [result, setResult] = useState("");
  const c = company.primaryColor;

  const hijriMonths = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];

  const convertGtoH = (dateStr: string) => {
    try {
      const m = moment(dateStr, 'YYYY-MM-DD');
      if (!m.isValid()) return "تاريخ غير صالح";
      return m.format('iDD iMMMM iYYYY');
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  const convertHtoG = (h: { day: number, month: number, year: number }) => {
    try {
      const m = moment(`${h.year}/${h.month}/${h.day}`, 'iYYYY/iM/iD');
      if (!m.isValid()) return "تاريخ غير صالح";
      return m.format('YYYY-MM-DD');
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  useEffect(() => {
    if (mode === "GtoH") {
      setResult(convertGtoH(gregorian));
    } else {
      setResult(convertHtoG(hijriDate));
    }
  }, [gregorian, hijriDate, mode]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">📅</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">محول التاريخ الذكي</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Hijri & Gregorian Converter</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl">
            <button 
              onClick={() => setMode("GtoH")}
              className={`flex-1 py-2.5 rounded-lg border-none transition-all font-bold text-xs md:text-sm ${mode === "GtoH" ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
              style={{ background: mode === "GtoH" ? c : undefined }}
            >
              ميلادي ← هجري
            </button>
            <button 
              onClick={() => setMode("HtoG")}
              className={`flex-1 py-2.5 rounded-lg border-none transition-all font-bold text-xs md:text-sm ${mode === "HtoG" ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
              style={{ background: mode === "HtoG" ? c : undefined }}
            >
              هجري ← ميلادي
            </button>
          </div>

          {mode === "GtoH" ? (
            <div className="mb-8">
              <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-widest">التاريخ الميلادي (Gregorian)</label>
              <input 
                type="date" 
                value={gregorian}
                onChange={(e) => setGregorian(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all text-lg font-bold"
                style={{ "--tw-ring-color": c + "44" } as any}
              />
            </div>
          ) : (
            <div className="mb-8">
              <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-widest">التاريخ الهجري (Hijri)</label>
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={hijriDate.day}
                  onChange={(e) => setHijriDate(p => ({ ...p, day: parseInt(e.target.value) }))}
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all font-bold text-sm"
                  style={{ "--tw-ring-color": c + "44" } as any}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={hijriDate.month}
                  onChange={(e) => setHijriDate(p => ({ ...p, month: parseInt(e.target.value) }))}
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all font-bold text-sm"
                  style={{ "--tw-ring-color": c + "44" } as any}
                >
                  {hijriMonths.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <input 
                  type="number"
                  value={hijriDate.year}
                  onChange={(e) => setHijriDate(p => ({ ...p, year: parseInt(e.target.value) }))}
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none transition-all font-bold text-sm"
                  style={{ "--tw-ring-color": c + "44" } as any}
                  placeholder="السنة"
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50/50 border-2 border-dashed rounded-2xl p-8 text-center" style={{ borderColor: c + "22" }}>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3" style={{ color: c }}>
              {mode === "GtoH" ? "التاريخ الهجري المقابل" : "التاريخ الميلادي المقابل"}
            </div>
            <div className="text-2xl md:text-3xl font-black text-gray-900">{result}</div>
          </div>

          <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
            <strong className="text-gray-600">ملاحظة:</strong> يعتمد المحول على تقويم أم القرى (Umm al-Qura) المستخدم رسمياً في المملكة العربية السعودية. قد يختلف التاريخ الفعلي برؤية الهلال بمقدار يوم واحد في بعض الحالات.
          </div>
        </div>
      </div>
    </div>
  );
};
