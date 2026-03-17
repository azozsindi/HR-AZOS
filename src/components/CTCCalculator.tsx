import React, { useState, useEffect } from "react";

interface CTCCalculatorProps {
  company: any;
  onBack: () => void;
}

export const CTCCalculator: React.FC<CTCCalculatorProps> = ({ company, onBack }) => {
  const [basic, setBasic] = useState<number>(5000);
  const [housing, setHousing] = useState<number>(1250);
  const [transport, setTransport] = useState<number>(500);
  const [otherAllowances, setOtherAllowances] = useState<number>(0);
  const [isSaudi, setIsSaudi] = useState<boolean>(true);
  const [medicalInsurance, setMedicalInsurance] = useState<number>(200); // Monthly
  const [govtFees, setGovtFees] = useState<number>(0); // Monthly (Iqama, Work Permit etc)
  const [ticketProvision, setTicketProvision] = useState<number>(100); // Monthly provision
  
  const [results, setResults] = useState({
    grossSalary: 0,
    gosiCompany: 0,
    totalMonthly: 0,
    totalYearly: 0,
  });

  const c = company.primaryColor;

  useEffect(() => {
    const gross = basic + housing + transport + otherAllowances;
    
    // GOSI Calculation (Company Share)
    // GOSI is calculated on Basic + Housing only
    const gosiBase = Math.min(basic + housing, 45000);
    // Saudi: 11.75% (9% Pension + 2% Occupational Hazards + 0.75% Saned)
    // Non-Saudi: 2% (Occupational Hazards)
    const gosiRate = isSaudi ? 0.1175 : 0.02;
    const gosiCompany = gosiBase * gosiRate;

    const totalMonthly = gross + gosiCompany + medicalInsurance + govtFees + ticketProvision;
    const totalYearly = totalMonthly * 12;

    setResults({
      grossSalary: gross,
      gosiCompany,
      totalMonthly,
      totalYearly,
    });
  }, [basic, housing, transport, otherAllowances, isSaudi, medicalInsurance, govtFees, ticketProvision]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">🏢</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">حاسبة تكلفة الموظف (CTC)</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Total Cost to Company Calculator</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Inputs */}
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-l border-gray-100">
            <h3 className="text-sm font-bold mb-5 pb-2 border-b-2" style={{ color: c, borderColor: c + "22" }}>بيانات الراتب والمزايا</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold mb-2 text-gray-700">الجنسية</label>
              <div className="flex gap-2">
                <button onClick={() => setIsSaudi(true)} className={`flex-1 py-2 rounded-lg border-2 transition-all font-bold text-xs ${isSaudi ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: isSaudi ? c : undefined }}>سعودي</button>
                <button onClick={() => setIsSaudi(false)} className={`flex-1 py-2 rounded-lg border-2 transition-all font-bold text-xs ${!isSaudi ? 'border-current bg-current/5' : 'border-gray-100 bg-white text-gray-400'}`} style={{ color: !isSaudi ? c : undefined }}>وافد / مقيم</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">الراتب الأساسي</label>
                <input type="number" value={basic} onChange={e => setBasic(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">بدل السكن</label>
                <input type="number" value={housing} onChange={e => setHousing(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">بدل النقل</label>
                <input type="number" value={transport} onChange={e => setTransport(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">بدلات أخرى</label>
                <input type="number" value={otherAllowances} onChange={e => setOtherAllowances(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
            </div>

            <h3 className="text-sm font-bold mt-8 mb-5 pb-2 border-b-2" style={{ color: c, borderColor: c + "22" }}>تكاليف إضافية (شهرية)</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">التأمين الطبي</label>
                <input type="number" value={medicalInsurance} onChange={e => setMedicalInsurance(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700">الرسوم الحكومية</label>
                <input type="number" value={govtFees} onChange={e => setGovtFees(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-gray-700">مخصص تذاكر السفر</label>
              <input type="number" value={ticketProvision} onChange={e => setTicketProvision(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>
          </div>

          {/* Results */}
          <div className="p-6 md:p-8 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 mb-6 text-center">ملخص التكلفة التشغيلية</h3>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-xs md:text-sm text-gray-500">إجمالي الراتب (Gross)</span>
                <span className="font-bold text-sm md:text-base">{results.grossSalary.toLocaleString()} ريال</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-xs md:text-sm text-gray-500">حصة الشركة في التأمينات</span>
                <span className="font-bold text-sm md:text-base text-orange-600">{results.gosiCompany.toLocaleString()} ريال</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-xs md:text-sm text-gray-500">التكاليف التشغيلية الأخرى</span>
                <span className="font-bold text-sm md:text-base">{(medicalInsurance + govtFees + ticketProvision).toLocaleString()} ريال</span>
              </div>
              
              <div className="p-4 rounded-xl text-center mt-4" style={{ background: c + "11" }}>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1" style={{ color: c }}>التكلفة الشهرية الإجمالية</div>
                <div className="text-3xl font-black" style={{ color: c }}>{results.totalMonthly.toLocaleString()} <span className="text-sm">ريال</span></div>
              </div>
            </div>

            <div className="bg-gray-800 text-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-[10px] md:text-xs opacity-60 uppercase tracking-widest mb-1">التكلفة السنوية التقديرية (CTC)</div>
              <div className="text-4xl font-black">{results.totalYearly.toLocaleString()} <span className="text-base">ريال</span></div>
            </div>

            <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
              <strong className="text-gray-600">ملاحظة:</strong> تشمل التكلفة حصة صاحب العمل في التأمينات الاجتماعية (GOSI) والمزايا المباشرة وغير المباشرة. لا تشمل تكاليف التدريب أو الأدوات المكتبية.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
