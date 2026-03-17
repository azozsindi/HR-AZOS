import React, { useState } from "react";

interface InterviewScorecardProps {
  company: any;
  onBack: () => void;
}

export const InterviewScorecard: React.FC<InterviewScorecardProps> = ({ company, onBack }) => {
  const [candidate, setCandidate] = useState("");
  const [position, setPosition] = useState("");
  const [scores, setScores] = useState({
    skills: 5,
    experience: 5,
    culture: 5,
    appearance: 5,
    communication: 5
  });
  const [notes, setNotes] = useState("");

  const c = company.primaryColor;

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const averageScore = totalScore / Object.keys(scores).length;
  const recommendation = averageScore >= 8 ? "Recommend (قوي جداً)" : averageScore >= 6 ? "Recommend (مقبول)" : "Reject (غير مناسب)";

  const handleScoreChange = (key: keyof typeof scores, val: number) => {
    setScores(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">📋</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">منظم المقابلات (Interview Scorecard)</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Candidate Evaluation Tool</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-l border-gray-100">
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">اسم المرشح</label>
                <input type="text" value={candidate} onChange={e => setCandidate(e.target.value)} placeholder="اسم المتقدم" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">المنصب المستهدف</label>
                <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="المسمى الوظيفي" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
            </div>

            <h3 className="text-sm font-bold mb-5 pb-2 border-b-2" style={{ color: c, borderColor: c + "22" }}>التقييم (من 10)</h3>
            
            <div className="space-y-4">
              {Object.entries(scores).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-600">{key === "skills" ? "المهارات الفنية" : key === "experience" ? "الخبرة السابقة" : key === "culture" ? "الملاءمة الثقافية" : key === "appearance" ? "المظهر والاحترافية" : "مهارات التواصل"}</label>
                    <span className="text-xs font-black" style={{ color: c }}>{val}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={val} onChange={e => handleScoreChange(key as any, Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current" style={{ color: c }} />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold mb-1.5 text-gray-700">ملاحظات إضافية</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all resize-none" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col justify-center items-center text-center">
            <div className="mb-10">
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-2">النتيجة النهائية</div>
              <div className="text-6xl md:text-7xl font-black transition-colors duration-500" style={{ color: averageScore >= 6 ? "#27ae60" : "#e74c3c" }}>{averageScore.toFixed(1)}</div>
              <div className="text-sm md:text-base font-black text-gray-800 mt-4 uppercase tracking-wider">{recommendation}</div>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <button onClick={() => window.print()} className="w-full py-4 rounded-xl border-none text-white font-black text-sm uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: c }}>🖨️ طباعة التقييم</button>
              <button onClick={() => { setCandidate(""); setPosition(""); setNotes(""); setScores({ skills: 5, experience: 5, culture: 5, appearance: 5, communication: 5 }); }} className="w-full py-4 rounded-xl border-2 font-black text-sm uppercase tracking-widest hover:bg-white transition-all" style={{ color: c, borderColor: c }}>🔄 إعادة تعيين</button>
            </div>

            <div className="mt-10 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 italic max-w-xs">
              <strong className="text-gray-600">نصيحة:</strong> استخدم هذا النموذج لتوحيد معايير التقييم بين جميع المقابلات لضمان العدالة واختيار الأكفأ.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
