import React, { useState, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  type: "iqama" | "passport" | "rent" | "other";
  expiryDate: string;
  note?: string;
}

interface SmartAlertsProps {
  company: any;
  onBack: () => void;
}

import { auth, db } from "../lib/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where } from "firebase/firestore";

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ company, onBack }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Document["type"]>("iqama");
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");
  
  const c = company.primaryColor;
  const today = new Date("2026-03-02"); // Using the provided current time

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "alerts"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Document));
      setDocuments(docs);
      // Also update localStorage for the badge count in App.tsx
      localStorage.setItem("hr-docs-alerts", JSON.stringify(docs));
    }, (error) => {
      console.error("Firestore snapshot error (alerts):", error);
    });

    return () => unsubscribe();
  }, []);

  const addDocument = async () => {
    if (!newName || !newDate) return;
    const user = auth.currentUser;
    if (!user) return;

    const id = Math.random().toString(36).substr(2, 9);
    const newDoc: any = {
      id,
      name: newName,
      type: newType,
      expiryDate: newDate,
      note: newNote,
      userId: user.uid
    };
    
    try {
      await setDoc(doc(db, "alerts", id), newDoc);
      setNewName("");
      setNewDate("");
      setNewNote("");
    } catch (e) {
      console.error("Error adding document", e);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, "alerts", id));
    } catch (e) {
      console.error("Error deleting document", e);
    }
  };

  const getAlerts = () => {
    return documents.filter(doc => {
      const expiry = new Date(doc.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays > 0;
    });
  };

  const getStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "منتهي", color: "#e74c3c", bg: "#fdf2f2" };
    if (diffDays <= 30) return { label: `ينتهي خلال ${diffDays} يوم (عاجل)`, color: "#e67e22", bg: "#fffaf0" };
    if (diffDays <= 90) return { label: `ينتهي خلال ${diffDays} يوم`, color: "#f1c40f", bg: "#fefce8" };
    return { label: `صالح لـ ${diffDays} يوم`, color: "#27ae60", bg: "#f0fdf4" };
  };

  const alerts = getAlerts();

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white relative" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2 relative inline-block">
            🔔
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {alerts.length}
              </span>
            )}
          </div>
          <h2 className="m-0 text-lg md:text-xl font-bold">نظام التنبيهات الذكية</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">Smart Document Expiry Alerts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr]">
          {/* Add Form */}
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-l border-gray-100">
            <h3 className="text-sm font-bold mb-5 pb-2 border-b-2" style={{ color: c, borderColor: c + "22" }}>إضافة وثيقة للمتابعة</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-gray-700">اسم الوثيقة / الموظف</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="مثال: إقامة محمد علي" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-gray-700">نوع الوثيقة</label>
              <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any}>
                <option value="iqama">هوية مقيم (إقامة)</option>
                <option value="passport">جواز سفر</option>
                <option value="rent">عقد إيجار</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-gray-700">تاريخ الانتهاء</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all" style={{ "--tw-ring-color": c + "44" } as any} />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-1.5 text-gray-700">ملاحظة</label>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="أضف ملاحظات إضافية هنا..." className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-all text-xs resize-none" rows={2} style={{ "--tw-ring-color": c + "44" } as any} />
            </div>

            <button onClick={addDocument} className="w-full py-3 rounded-xl border-none font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: c }}>إضافة للتنبيهات ➕</button>

            {alerts.length > 0 && (
              <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-red-700 font-bold text-sm mb-2 flex items-center gap-2">
                  <span>⚠️</span> تنبيهات نشطة ({alerts.length})
                </div>
                <div className="text-xs text-red-800 leading-relaxed">
                  لديك وثائق ستنتهي خلال أقل من 90 يوماً. يرجى البدء في إجراءات التجديد.
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <div className="p-6 md:p-8 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 mb-5">قائمة الوثائق المتابعة</h3>
            
            {documents.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                لا توجد وثائق مضافة حالياً. ابدأ بإضافة أول وثيقة.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {documents.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).map(doc => {
                  const status = getStatus(doc.expiryDate);
                  return (
                    <div key={doc.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-800 mb-1">{doc.name}</div>
                        <div className={`text-[10px] md:text-xs text-gray-500 flex flex-wrap gap-3 ${doc.note ? 'mb-2' : ''}`}>
                          <span className="flex items-center gap-1">📅 {doc.expiryDate}</span>
                          <span className="flex items-center gap-1">📂 {doc.type === "iqama" ? "إقامة" : doc.type === "passport" ? "جواز" : doc.type === "rent" ? "إيجار" : "أخرى"}</span>
                        </div>
                        {doc.note && (
                          <div className="text-[10px] md:text-xs text-gray-600 bg-gray-50 p-2 rounded border-r-4" style={{ borderColor: c }}>
                            {doc.note}
                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <div className="text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ color: status.color, background: status.bg }}>{status.label}</div>
                        <button onClick={() => deleteDocument(doc.id)} className="bg-transparent border-none text-red-400 cursor-pointer text-xs hover:text-red-600 transition-colors">حذف</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
