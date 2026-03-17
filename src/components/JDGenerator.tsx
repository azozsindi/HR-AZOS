import React, { useState } from "react";

interface JDGeneratorProps {
  company: any;
  onBack: () => void;
}

export const JDGenerator: React.FC<JDGeneratorProps> = ({ company, onBack }) => {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [experience, setExperience] = useState("1-3 سنوات");
  const [skills, setSkills] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [generatedJD, setGeneratedJD] = useState<string | null>(null);

  const c = company.primaryColor;

  const handleGenerate = () => {
    const jd = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; padding: 40px; border: 1px solid #eee; background: #fff;">
        <div style="text-align: center; border-bottom: 2px solid ${c}; padding-bottom: 20px; marginBottom: 30px;">
          <h1 style="margin: 0; color: ${c}; fontSize: 24px;">الوصف الوظيفي: ${title || "مسمى الوظيفي"}</h1>
          <p style="margin: 5px 0 0; color: #666;">${company.name} | قسم ${department || "الإدارة"}</p>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: ${c}; border-right: 4px solid ${c}; padding-right: 10px;">الهدف من الوظيفة</h3>
          <p style="line-height: 1.6; color: #444;">نحن نبحث عن ${title} موهوب للانضمام إلى فريقنا في ${company.name}. سيكون الدور محورياً في تحقيق أهداف القسم والمساهمة في نمو الشركة.</p>
        </div>

        <div style="margin-top: 25px;">
          <h3 style="color: ${c}; border-right: 4px solid ${c}; padding-right: 10px;">المسؤوليات الأساسية</h3>
          <ul style="line-height: 1.8; color: #444;">
            ${responsibilities.split('\n').filter(r => r.trim()).map(r => `<li>${r}</li>`).join('') || "<li>المساهمة في تطوير العمليات اليومية.</li><li>التعاون مع أعضاء الفريق لتحقيق الأهداف.</li>"}
          </ul>
        </div>

        <div style="margin-top: 25px;">
          <h3 style="color: ${c}; border-right: 4px solid ${c}; padding-right: 10px;">المهارات والمؤهلات المطلوبة</h3>
          <p><strong>الخبرة:</strong> ${experience}</p>
          <ul style="line-height: 1.8; color: #444;">
            ${skills.split('\n').filter(s => s.trim()).map(s => `<li>${s}</li>`).join('') || "<li>مهارات تواصل ممتازة.</li><li>القدرة على العمل تحت الضغط.</li>"}
          </ul>
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-radius: 8px; font-size: 13px; color: #666; text-align: center;">
          للتقديم، يرجى إرسال السيرة الذاتية إلى: ${company.email}
        </div>
      </div>
    `;
    setGeneratedJD(jd);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">✍️</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">مولد الوصف الوظيفي الذكي</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">JD Generator Tool</p>
        </div>

        <div className={`grid grid-cols-1 ${generatedJD ? "lg:grid-cols-2" : ""}`}>
          <div className={`p-6 md:p-8 ${generatedJD ? "border-b lg:border-b-0 lg:border-l border-gray-100" : ""}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">المسمى الوظيفي</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: محاسب مالي" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">القسم</label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="مثال: المالية" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">سنوات الخبرة</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any}>
                  <option>حديث تخرج</option>
                  <option>1-3 سنوات</option>
                  <option>3-5 سنوات</option>
                  <option>+5 سنوات</option>
                  <option>+10 سنوات (إداري)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">المسؤوليات (كل سطر مسؤولية)</label>
                <textarea value={responsibilities} onChange={e => setResponsibilities(e.target.value)} rows={4} placeholder="إعداد التقارير المالية&#10;مراجعة الحسابات اليومية" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all resize-none" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">المهارات المطلوبة (كل سطر مهارة)</label>
                <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={3} placeholder="إجادة برنامج Excel&#10;اللغة الإنجليزية" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all resize-none" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <button onClick={handleGenerate} className="w-full py-4 rounded-xl border-none text-white font-black text-sm uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: c }}>توليد الوصف الوظيفي ✨</button>
            </div>
          </div>

          {generatedJD && (
            <div className="p-6 md:p-8 bg-gray-50/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-800">المعاينة النهائية</h3>
                <button onClick={() => {
                  const win = window.open('', '_blank');
                  win?.document.write(generatedJD);
                  win?.document.close();
                  win?.print();
                }} className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-xs hover:bg-white transition-all" style={{ color: c, borderColor: c }}>🖨️ طباعة</button>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white" dangerouslySetInnerHTML={{ __html: generatedJD }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
