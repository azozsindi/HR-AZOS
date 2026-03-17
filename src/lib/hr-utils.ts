// src/lib/hr-utils.ts
import { Company } from "../types";

export function printHtml(html: string) {
  const css = [
    "* { box-sizing: border-box; margin: 0; padding: 0; }",
    "body { font-family: 'Segoe UI',Tahoma,Arial,sans-serif; direction: rtl; font-size: 11pt; color: #222; padding: 14mm; }",
    "table { border-collapse: collapse; width: 100%; margin-bottom: 14px; }",
    "th, td { border: 1px solid #ddd; padding: 6px 10px; }",
    "img { max-width: 100%; }",
    "@media print { body { padding: 10mm; } }"
  ].join("\n");

  const scriptContent = "window.onload=function(){window.print();}";
  const scriptTag = "<scr" + "ipt>" + scriptContent + "<\/scr" + "ipt>";

  const fullPage = [
    "<!DOCTYPE html><html><head><meta charset='utf-8'>",
    "<style>", css, "</style>",
    "</head><body>",
    html,
    scriptTag,
    "</body></html>"
  ].join("\n");

  try {
    const blob = new Blob([fullPage], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    if (!win) throw new Error("blocked");
  } catch(e) {
    try {
      const win2 = window.open("", "_blank");
      if (win2) {
        win2.document.open();
        win2.document.write(fullPage);
        win2.document.close();
        setTimeout(() => { try { win2.print(); } catch(_) {} }, 500);
      }
    } catch(_) {}
  }
}

export function buildDoc(formId: string, data: any, company: Company) {
  const today = new Date();
  const tAr = today.toLocaleDateString("ar-SA-u-ca-gregory",{year:"numeric",month:"long",day:"numeric"});
  const tEn = today.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const c = company.primaryColor;

  const logoHtml = company.logo
    ? `<img src="${company.logo}" style="height:54px;object-fit:contain;" />`
    : `<div style="font-size:19px;font-weight:900;color:${c};">${company.nameEn||company.name}</div>`;

  const hdr = `<div style="direction:rtl;font-family:'Segoe UI',Tahoma,Arial,sans-serif;position:relative;overflow:hidden;padding-top:10px;">
    <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg, ${c}, ${c}33, ${c});"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:15px;border-bottom:1px solid #eee;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:15px;">
        <div style="border-left:3px solid ${c};padding-left:15px;">${logoHtml}</div>
        <div>
          <div style="font-weight:900;font-size:14px;color:#333;">${company.name}</div>
          <div style="font-size:10px;color:#888;letter-spacing:0.5px;">${company.nameEn||""}</div>
          <div style="font-size:9px;color:${c};margin-top:2px;font-weight:600;">${company.tagline||""}</div>
        </div>
      </div>
      <div style="text-align:left;font-size:9px;color:#666;line-height:1.7;background:#fcfcfc;padding:8px 12px;border-radius:6px;border:1px solid #f0f0f0;">
        <div>📍 ${company.address}</div>
        <div>📞 ${company.phone} | ✉️ ${company.email}</div>
        <div style="color:${c};font-weight:600;">🌐 ${company.website}</div>
      </div>
    </div>`;
  const ftr = `<div style="margin-top:40px;padding-top:12px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:8px;color:#999;position:relative;">
    <div style="position:absolute;bottom:-10px;left:0;right:0;height:2px;background:${c}15;"></div>
    <span>${company.name} | ${company.nameEn||""}</span>
    <span style="color:${c};font-weight:700;">${company.website}</span>
    <span>${company.phone}</span>
  </div></div>`;

  const row = (ar: string, en: string, v: any) => v
    ? `<tr><td style="padding:6px 10px;font-weight:700;color:#333;background:#f7f7f9;width:30%;font-size:11px;">${ar}<br><span style="font-size:9px;color:#aaa;font-weight:400;">${en}</span></td><td style="padding:6px 10px;font-size:12px;">${v}</td></tr>` : "";
  const tbl = (r: string) => `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${r}</table>`;
  const h = (ar: string, en: string) => `<div style="text-align:center;margin-bottom:18px;">
    <div style="font-size:17px;font-weight:900;color:${c};border:2px solid ${c};display:inline-block;padding:6px 26px;border-radius:4px;">${ar} | ${en}</div>
    <div style="font-size:10px;color:#aaa;margin-top:4px;">${tAr} | ${tEn}</div></div>`;
  const box = (ar: string, en: string, txt: string) => txt ? `<div style="margin-bottom:14px;"><div style="font-weight:700;color:#444;margin-bottom:4px;font-size:11px;">${ar} / ${en}:</div><div style="border:1px solid #eee;padding:10px;background:#fafafa;border-radius:4px;font-size:12px;line-height:1.7;white-space:pre-wrap;">${txt}</div></div>` : "";
  
  const stampBlock = (() => {
    const mode = company.stampMode || "manual";
    if (mode === "none") return "";
    if (mode === "digital" && company.stampImage) {
      return `<div style="text-align:center;"><img src="${company.stampImage}" style="height:70px;width:70px;object-fit:contain;opacity:0.85;display:block;margin:0 auto 2px;" /><div style="font-size:9px;color:#aaa;">Official Stamp</div></div>`;
    }
    return `<div style="text-align:center;"><div style="width:70px;height:70px;border:2px dashed #bbb;border-radius:50%;margin:0 auto 2px;display:flex;align-items:center;justify-content:center;"><span style="font-size:8px;color:#ccc;text-align:center;line-height:1.3;">ختم<br>Stamp</span></div><div style="font-size:9px;color:#ccc;">يدوي</div></div>`;
  })();

  const sig3 = `<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:32px;gap:8px;">
    <div style="text-align:center;flex:1;"><div style="border-top:1px solid #555;padding-top:5px;font-size:10px;color:#444;">توقيع الموظف / Employee</div></div>
    <div style="text-align:center;flex:1;"><div style="border-top:1px solid #555;padding-top:5px;font-size:10px;color:#444;">توقيع المدير / Manager</div></div>
    <div style="text-align:center;flex:1;">${stampBlock}<div style="border-top:1px solid #555;padding-top:5px;font-size:10px;color:#444;margin-top:4px;">الإدارة / Management</div></div>
  </div>`;
  const sig2 = `<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:32px;gap:40px;">
    <div style="text-align:center;flex:1;"><div style="border-top:1px solid #555;padding-top:5px;font-size:10px;color:#444;">توقيع الموظف / Employee</div></div>
    <div style="text-align:center;flex:1;">${stampBlock}<div style="border-top:1px solid #555;padding-top:5px;font-size:10px;color:#444;margin-top:4px;">توقيع صاحب العمل / Employer</div></div>
  </div>`;
  const renderStamp = () => {
    const mode = company.stampMode || "manual";
    if (mode === "none") {
      return `<div style="display:flex;justify-content:flex-end;margin-top:28px;">
        <div style="text-align:center;">
          <div style="border-top:1px solid #555;width:200px;padding-top:5px;font-size:10px;color:#444;">توقيع المفوّض / Authorized Signature</div>
        </div>
      </div>`;
    }
    if (mode === "digital" && company.stampImage) {
      return `<div style="display:flex;justify-content:flex-end;margin-top:28px;gap:24px;align-items:flex-end;">
        <div style="text-align:center;">
          <img src="${company.stampImage}" style="height:90px;width:90px;object-fit:contain;opacity:0.85;margin-bottom:4px;" />
          <div style="border-top:1px solid #555;width:100px;margin:0 auto;padding-top:5px;font-size:10px;color:#444;">الختم الرسمي / Official Stamp</div>
        </div>
        <div style="text-align:center;">
          <div style="border-top:1px solid #555;width:180px;padding-top:5px;font-size:10px;color:#444;">توقيع المفوّض / Authorized Signature</div>
        </div>
      </div>`;
    }
    return `<div style="display:flex;justify-content:flex-end;margin-top:28px;gap:24px;align-items:flex-end;">
      <div style="text-align:center;">
        <div style="width:90px;height:90px;border:2px dashed #bbb;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:9px;color:#ccc;text-align:center;line-height:1.4;">ختم<br>Stamp</span>
        </div>
        <div style="font-size:9px;color:#bbb;">مساحة الختم اليدوي</div>
      </div>
      <div style="text-align:center;">
        <div style="border-top:1px solid #555;width:180px;padding-top:5px;font-size:10px;color:#444;">توقيع المفوّض / Authorized Signature</div>
      </div>
    </div>`;
  };
  const stamp = renderStamp();
  const pledgeText = (arText: string, enText: string) => `<div style="border:1px solid ${c};padding:12px;border-radius:4px;background:#f8f6ff;margin-bottom:14px;font-size:11px;line-height:1.8;color:#333;">
    <strong>الإقرار (عربي):</strong> ${arText}<br><br><strong>Pledge (English):</strong> ${enText}</div>`;

  const bodies: Record<string, string> = {
    job_offer: h("عرض وظيفي","Job Offer") +
      `<div style="margin-bottom:14px;color:#333;font-size:12px;line-height:1.9;">يسعدنا أن نتقدم إلى السيد/السيدة <strong>${data.empName||"___"}</strong> بهذا العرض الوظيفي من شركة <strong>${company.name}</strong>:<br><span style="color:#888;font-size:10px;">We are pleased to extend this job offer from <strong>${company.nameEn||company.name}</strong> to the above-mentioned candidate:</span></div>` +
      tbl(row("المسمى الوظيفي","Job Title",data.jobTitle)+row("القسم","Department",data.dept)+row("الراتب الأساسي","Basic Salary",data.salary?data.salary+" SAR":"")+row("البدلات","Allowances",data.allowances?data.allowances+" SAR":"")+row("تاريخ بدء العمل","Start Date",data.startDate)+row("فترة الاختبار","Probation",data.probation)+row("صلاحية العرض حتى","Offer Valid Until",data.offerExpiry)) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;line-height:1.8;">هذا العرض مشروط باستيفاء متطلبات التوثيق وفحوصات ما قبل التوظيف. / This offer is subject to documentation and pre-employment checks.</div>` + sig2,

    contract: h("عقد عمل","Employment Contract") +
      `<div style="font-size:11px;color:#555;margin-bottom:14px;line-height:1.8;">تم إبرام هذا العقد بين شركة <strong>${company.name}</strong> (صاحب العمل) والموظف الآتي بيانه.<br><span style="color:#aaa;">This contract is entered into between <strong>${company.nameEn||company.name}</strong> (Employer) and the following employee.</span></div>` +
      tbl(row("اسم الموظف","Employee Name",data.empName)+row("رقم الهوية / الإقامة","ID",data.empId)+row("الجنسية","Nationality",data.nationality)+row("المسمى الوظيفي","Job Title",data.jobTitle)+row("القسم","Department",data.dept)+row("تاريخ بدء العمل","Start Date",data.startDate)+row("نوع العقد","Contract Type",data.contractType)+(data.endDate?row("تاريخ الانتهاء","End Date",data.endDate):"")+row("الراتب الأساسي","Basic Salary",data.salary?data.salary+" SAR":"")+row("البدلات","Allowances",data.allowances?data.allowances+" SAR":"")+row("ساعات العمل","Work Hours",data.workHours?data.workHours+" hrs/day":"")+row("فترة الاختبار","Probation",data.probation)) +
      `<div style="font-size:10px;color:#777;border:1px solid #eee;padding:8px;background:#fafafa;margin-bottom:14px;line-height:1.8;">يلتزم الطرفان بأحكام نظام العمل السعودي. / Both parties agree to comply with Saudi Labor Law.</div>` + sig2,

    joining: h("نموذج مباشرة عمل","Joining Report") +
      tbl(row("اسم الموظف","Employee Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى الوظيفي","Job Title",data.jobTitle)+row("القسم","Department",data.dept)+row("تاريخ المباشرة","Joining Date",data.joinDate)+row("المدير المباشر","Line Manager",data.manager)) +
      `<div style="font-size:11px;color:#333;margin-bottom:14px;line-height:1.8;">يُقرّ الموظف المذكور أعلاه بمباشرة عمله فعلياً في التاريخ المحدد. / The above-mentioned employee confirms having commenced employment on the stated date.</div>` + sig3,

    nda: h("اتفاقية عدم إفصاح","NDA") +
      tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى الوظيفي","Title",data.jobTitle)+row("تاريخ التوقيع","Sign Date",data.signDate)) +
      pledgeText(
        `أتعهد أنا الموظف المذكور أعلاه بعدم الإفصاح عن أي معلومات سرية خاصة بشركة ${company.name} سواء أثناء فترة عملي أو بعد انتهائها.`,
        `I, the undersigned, pledge not to disclose any confidential information belonging to ${company.nameEn||company.name} during or after my employment.`
      ) + sig2,

    asset_recv: h("نموذج استلام عهدة","Asset Handover Form") +
      tbl(row("اسم الموظف","Employee Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("تاريخ الاستلام","Received Date",data.recvDate)) +
      box("قائمة العهد","Assets List",data.items) +
      `<div style="font-size:11px;color:#333;margin-bottom:14px;line-height:1.8;">أتعهد بالحفاظ على هذه العهد وإعادتها بحالة جيدة عند انتهاء خدمتي. / I pledge to maintain these assets and return them in good condition upon end of service.</div>` + sig3,

    leave: h("طلب إجازة","Leave Request") +
      tbl(row("اسم الموظف","Employee Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("نوع الإجازة","Leave Type",data.leaveType)+row("من","From",data.dateFrom)+row("إلى","To",data.dateTo)+row("عدد الأيام","Days",data.days)) +
      box("السبب","Reason",data.reason) + sig3,

    salary_cert: h("شهادة راتب","Salary Certificate") +
      `<div style="margin-bottom:12px;font-size:11px;color:#333;line-height:1.8;">تُفيد شركة <strong>${company.name}</strong> بأن الموظف الآتي يعمل لديها. / <span style="color:#888;">${company.nameEn||""} certifies that the following employee is on its payroll.</span></div>` +
      tbl(row("الاسم","Full Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("تاريخ الالتحاق","Hire Date",data.hireDate)+row("الراتب الأساسي","Basic Salary",data.salary?data.salary+" SAR":"")+row("البدلات","Allowances",data.allowances?data.allowances+" SAR":"")+row("الإجمالي","Total",data.totalSalary?`<strong style="color:${c};font-size:14px;">${data.totalSalary} SAR</strong>`:"")) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;line-height:1.8;">أُصدرت لتقديمها إلى: <strong>${data.issuedFor||"الجهة المعنية"}</strong> / Issued to: <strong>${data.issuedFor||"the concerned party"}</strong>. لا تُعدّ هذه الشهادة ضماناً باستمرار العقد.</div>` + stamp,

    intro_letter: h("خطاب تعريف","Introduction Letter") +
      tbl(row("الاسم","Full Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("الجنسية","Nationality",data.nationality)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("تاريخ الالتحاق","Hire Date",data.hireDate)) +
      `<div style="font-size:11px;color:#333;margin-bottom:14px;line-height:1.8;">يعمل لدينا حتى تاريخه موظفاً نظامياً، وقد أُصدر هذا الخطاب لتقديمه إلى: <strong>${data.issuedFor||"الجهة المعنية"}</strong>.<br><span style="color:#aaa;">Currently employed with us. This letter is issued upon request for submission to: <strong>${data.issuedFor||"the concerned party"}</strong>.</span></div>` + stamp,

    advance: h("طلب سلفة","Salary Advance") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("الراتب","Salary",data.salary?data.salary+" SAR":"")+row("مبلغ السلفة","Advance",data.amount?`<strong style="color:${c};">${data.amount} SAR</strong>`:"")+row("أشهر الاستقطاع","Deduction Months",data.months)+row("التاريخ","Date",data.date)) + box("السبب","Reason",data.reason) + sig3,

    timesheet: h("كشف وقت العمل","Timesheet") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("الشهر","Month",data.month)+row("إجمالي أيام العمل","Work Days",data.totalDays)+row("ساعات إضافية","OT Hours",data.otHours)+row("أيام الغياب","Absent Days",data.absences)) + box("ملاحظات","Notes",data.notes) + sig3,

    overtime: h("طلب عمل إضافي","Overtime Request") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("التاريخ","Date",data.otDate)+row("وقت البدء","Start",data.startTime)+row("وقت الانتهاء","End",data.endTime)+row("عدد الساعات","Hours",data.hours?data.hours+" hrs":"")) + box("السبب","Reason",data.reason) + sig3,

    biztrip: h("مهمة عمل / انتداب","Business Trip") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("الوجهة","Destination",data.dest)+row("من","From",data.dateFrom)+row("إلى","To",data.dateTo)+row("بدل الانتداب","Allowance",data.allowance?data.allowance+" SAR":"")) + box("الغرض","Purpose",data.purpose) + sig3,

    performance: h("تقييم أداء","Performance Appraisal") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("فترة التقييم","Period",data.period)) +
      `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead><tr style="background:${c};color:#fff;font-size:11px;">
        <th style="padding:7px 10px;text-align:right;">المعيار / Criteria</th><th style="padding:7px 10px;text-align:center;width:90px;">الدرجة</th><th style="padding:7px 10px;text-align:center;width:110px;">التقدير</th>
      </tr></thead><tbody>
      ${[["الأداء الوظيفي","Job Performance",data.score1],["الالتزام","Commitment",data.score2],["العمل الجماعي","Teamwork",data.score3],["المبادرة","Initiative",data.score4]].map(([ar,en,s])=>{const n=parseInt(s)||0;const g=n>=9?"ممتاز / Excellent":n>=7?"جيد جداً / Very Good":n>=5?"جيد / Good":"يحتاج تطوير / Needs Improvement";return `<tr><td style="padding:6px 10px;border:1px solid #eee;font-size:11px;">${ar} / <span style="color:#aaa">${en}</span></td><td style="padding:6px 10px;border:1px solid #eee;text-align:center;font-weight:700;">${s||"—"} / 10</td><td style="padding:6px 10px;border:1px solid #eee;text-align:center;font-size:10px;">${s?g:"—"}</td></tr>`;}).join("")}
      <tr style="background:#f5f5f7;font-weight:700;"><td style="padding:6px 10px;border:1px solid #eee;font-size:11px;">المجموع / Total</td><td style="padding:6px 10px;border:1px solid #eee;text-align:center;color:${c};font-size:14px;">${[data.score1,data.score2,data.score3,data.score4].reduce((a,b)=>(a||0)+(parseInt(b)||0),0)} / 40</td><td style="border:1px solid #eee;"></td></tr>
      </tbody></table>` + box("ملاحظات المقيّم","Reviewer Notes",data.comments) + sig3,

    verbal_warn: h("لفت نظر شفهي","Verbal Warning Record") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("التاريخ","Date",data.date)+row("اسم المدير","Manager",data.manager)) + box("السلوك المخالف","Violation",data.violation) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;">يُقرّ الموظف باستلامه هذا التنبيه الشفهي. / Employee acknowledges receipt of this verbal warning.</div>` + sig3,

    warning: h("خطاب إنذار","Written Warning") +
      `<div style="margin-bottom:12px;font-size:12px;color:#333;line-height:1.9;">بناءً على ما تبين للإدارة، يُوجَّه هذا <strong style="color:${c};">${data.warningType||"الإنذار"}</strong> للموظف:<br><span style="color:#aaa;font-size:10px;">Based on management's findings, this <strong>${data.warningType||"warning"}</strong> is issued to the employee:</span></div>` +
      tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("التاريخ","Date",data.date)) +
      `<div style="border:2px solid ${c};padding:12px;border-radius:4px;background:#fff8f8;margin-bottom:12px;font-size:12px;"><strong>المخالفة / Violation:</strong><br>${data.violation||"..."}</div>` +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;line-height:1.7;">وعليه يُطلب منه تصحيح هذا الوضع فوراً وإلا تعرّض للمساءلة. / The employee is required to immediately rectify this behavior, otherwise further action will be taken.</div>` + sig3,

    deduction: h("قرار خصم","Deduction Order") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("أيام الخصم","Days",data.days)+row("المبلغ المخصوم","Amount",data.amount?data.amount+" SAR":"")+row("التاريخ","Date",data.date)) + box("سبب الخصم","Reason",data.reason) + sig3,

    investigation: h("محضر تحقيق إداري","Investigation Record") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("التاريخ","Date",data.date)) + box("وصف الحادثة","Incident",data.incident) + box("أقوال الموظف","Employee Statement",data.empReply) + box("قرار لجنة التحقيق","Committee Decision",data.decision) + sig3,

    resignation: h("طلب استقالة","Resignation Letter") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("تاريخ الالتحاق","Hire Date",data.hireDate)+row("تاريخ الاستقالة","Resignation Date",data.resignDate)+row("آخر يوم عمل","Last Day",data.lastDay)) + box("السبب","Reason",data.reason) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;">أتعهد بإتمام إجراءات التسليم. / I commit to completing the handover process.</div>` + sig3,

    resign_accept: h("قبول استقالة","Resignation Acceptance") +
      `<div style="margin-bottom:12px;font-size:12px;color:#333;line-height:1.9;">تُقرّ الإدارة بقبول استقالة الموظف وفق التفاصيل الآتية:<br><span style="color:#aaa;font-size:10px;">Management hereby accepts the resignation of the below-mentioned employee:</span></div>` +
      tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("تاريخ تقديم الاستقالة","Resignation Date",data.resignDate)+row("آخر يوم عمل محدد","Last Working Day",data.lastDay)) + sig2,

    termination: h("إنهاء خدمات","Termination Notice") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("تاريخ الالتحاق","Hire Date",data.hireDate)+row("تاريخ الإنهاء","Termination Date",data.termDate)) + box("سبب الإنهاء","Reason",data.reason) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;">يلتزم الموظف بتسليم جميع ممتلكات الشركة. / The employee must return all company assets.</div>` + sig2,

    clearance: h("إخلاء طرف","Clearance Form") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("آخر يوم عمل","Last Working Day",data.lastDay)) +
      `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead><tr style="background:${c};color:#fff;font-size:11px;"><th style="padding:7px;">الجهة / Department</th><th style="padding:7px;">التوقيع / Signature</th><th style="padding:7px;">التاريخ / Date</th><th style="padding:7px;">ملاحظات / Notes</th></tr></thead>
      <tbody>${["المالية / Finance","IT / تقنية المعلومات","المخازن / Stores","الأمن / Security","المدير المباشر / Manager","الموارد البشرية / HR"].map(d=>`<tr><td style="padding:8px;border:1px solid #eee;font-size:11px;">${d}</td><td style="padding:8px;border:1px solid #eee;"></td><td style="padding:8px;border:1px solid #eee;"></td><td style="padding:8px;border:1px solid #eee;"></td></tr>`).join("")}</tbody></table>` + sig2,

    final_settle: h("مخالصة نهائية","Final Settlement") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("القسم","Department",data.dept)+row("تاريخ الالتحاق","Hire Date",data.hireDate)+row("آخر يوم عمل","Last Day",data.lastDay)+row("مكافأة نهاية الخدمة","EOSB",data.eosb?data.eosb+" SAR":"")+row("رصيد الإجازات","Leave Balance",data.leaveBalance?data.leaveBalance+" days":"")+row("قيمة الإجازات","Leave Encashment",data.leaveAmount?data.leaveAmount+" SAR":"")+row("الرواتب المتأخرة","Pending Salaries",data.pendingSalaries?data.pendingSalaries+" SAR":"")+row("الخصومات","Deductions",data.deductions?data.deductions+" SAR":"")+row("الإجمالي المستحق","Total Dues",data.totalAmount?`<strong style="color:${c};font-size:15px;">${data.totalAmount} SAR</strong>`:"")) +
      `<div style="border:2px solid ${c};padding:10px 14px;border-radius:4px;font-size:10px;color:#444;margin-bottom:14px;line-height:1.8;">يُقرّ الموظف باستلام كامل مستحقاته وعدم وجود أي مطالبة مستقبلية على الشركة. / The employee acknowledges full receipt of all dues and waives any future claims.</div>` + sig2,

    experience: h("شهادة خبرة","Experience Certificate") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("الجنسية","Nationality",data.nationality)+row("المسمى","Title",data.jobTitle)+row("القسم","Dept",data.dept)+row("تاريخ الالتحاق","From",data.hireDate)+row("آخر يوم","To",data.lastDay)+row("السلوك","Conduct",data.conduct)) +
      `<div style="font-size:11px;color:#333;margin-bottom:14px;line-height:1.8;">أدّى مهامه بكفاءة واجتهاد ونتمنى له التوفيق. / Performed duties with dedication and professionalism. We wish them success.</div>` + stamp,

    promotion: h("خطاب ترقية","Promotion Letter") +
      `<div style="margin-bottom:12px;font-size:12px;color:#333;line-height:1.9;">يسعدنا إخطار الموظف بترقيته وفق التفاصيل التالية:<br><span style="color:#aaa;font-size:10px;">We are pleased to inform the employee of their promotion as follows:</span></div>` +
      tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى الحالي","Current Title",data.oldTitle)+row("المسمى الجديد","New Title",`<strong style="color:${c};">${data.newTitle||""}</strong>`)+row("القسم","Dept",data.dept)+row("الراتب الحالي","Current Salary",data.oldSalary?data.oldSalary+" SAR":"")+row("الراتب الجديد","New Salary",data.newSalary?`<strong style="color:${c};">${data.newSalary} SAR</strong>`:"")+row("تاريخ السريان","Effective Date",data.effDate)) + sig2,

    transfer: h("أمر نقل","Transfer Order") + tbl(row("الاسم","Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("من","From",data.fromDept)+row("إلى","To",`<strong style="color:${c};">${data.toDept||""}</strong>`)+row("تاريخ السريان","Effective Date",data.effDate)) + box("السبب","Reason",data.reason) + sig3,
    
    marketing_comm: h("نموذج عمولة تسويقية","Marketing Commission") +
      tbl(row("الاسم","Name",data.empName)+row("الحملة","Campaign",data.campaign)+row("المبيعات","Sales",data.salesVal?data.salesVal+" SAR":"")+row("النسبة","Rate",data.commRate?data.commRate+"%":"")+row("المبلغ المستحق","Due Amount",data.commAmount?`<strong style="color:${c};font-size:15px;">${data.commAmount} SAR</strong>`:"")+row("التاريخ","Date",data.date)) + sig3,
    
    social_access: h("استلام حسابات التواصل","Social Media Access") +
      tbl(row("الاسم","Name",data.empName)+row("المنصات","Platforms",data.platforms)+row("الحسابات","Handles",data.accounts)+row("تاريخ الاستلام","Date",data.recvDate)) +
      pledgeText("أتعهد بالحفاظ على سرية بيانات الدخول وعدم استخدام الحسابات لأغراض شخصية.","I pledge to maintain login confidentiality and not use accounts for personal purposes.") + sig2,
    
    content_appr: h("نموذج اعتماد محتوى","Content Approval") +
      tbl(row("المعد","Creator",data.empName)+row("النوع","Type",data.contentType)+row("العنوان","Title",data.subject)+row("الرابط","Link",data.link?`<a href="${data.link}" style="color:${c};">${data.link}</a>`:"")+row("المعتمد","Approver",data.apprBy)+row("التاريخ","Date",data.date)) + sig2,
    
    creative_brief: h("موجز إبداعي","Creative Brief") +
      tbl(row("المشروع","Project",data.projName)+row("الجمهور","Audience",data.target)+row("الموعد","Deadline",data.deadline)+row("الميزانية","Budget",data.budget?data.budget+" SAR":"")) +
      box("الأهداف","Goals",data.goals) + sig3,

    exit_reentry: h("طلب تأشيرة خروج وعودة","Exit/Re-entry Visa Request") +
      tbl(row("الاسم","Name",data.empName)+row("رقم الإقامة","Iqama",data.empId)+row("الجواز","Passport",data.passport)+row("النوع","Type",data.visaType)+row("المدة","Duration",data.duration?data.duration+" days":"")+row("تاريخ السفر","Travel Date",data.travelDate)) + sig2,

    housing_req: h("طلب سكن / بدل سكن","Housing Request") +
      tbl(row("الاسم","Name",data.empName)+row("نوع الطلب","Type",data.reqType)+row("المبلغ","Amount",data.amount?data.amount+" SAR":"")) +
      box("ملاحظات","Notes",data.reason) + sig3,

    auth_letter: h("خطاب تفويض","Authorization Letter") +
      `<div style="margin-bottom:12px;font-size:12px;color:#333;line-height:1.9;">تُفيد شركة <strong>${company.name}</strong> بأنها قد فوّضت السيد/السيدة <strong>${data.empName||"___"}</strong> حامل الهوية رقم <strong>${data.empId||"___"}</strong> للقيام بـ:<br><span style="color:#aaa;font-size:10px;">${company.nameEn||""} hereby authorizes the below-mentioned person to:</span></div>` +
      box("غرض التفويض","Purpose",data.purpose) +
      `<div style="font-size:11px;color:#333;margin-bottom:14px;">وذلك لدى: <strong>${data.authTo||"الجهات المعنية"}</strong>. يسري هذا التفويض حتى تاريخ: <strong>${data.expiry||"___"}</strong>.</div>` + stamp,

    complaint: h("نموذج شكوى / تظلم","Employee Complaint") +
      tbl(row("الاسم","Name",data.empName)+row("الموضوع","Subject",data.subject)+row("ضد","Against",data.against)+row("التاريخ","Date",data.date)) +
      box("التفاصيل","Details",data.details) + sig3,

    influencer_aggr: h("اتفاقية مؤثر","Influencer Agreement") +
      tbl(row("المؤثر","Influencer",data.infName)+row("المنصة","Platform",data.platform)+row("المقابل","Fee",data.fee?data.fee+" SAR":"")+row("من","From",data.startDate)+row("إلى","To",data.endDate)) +
      box("المخرجات المطلوبة","Deliverables",data.deliverables) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;line-height:1.7;">يلتزم المؤثر بتقديم المحتوى المتفق عليه وفق المعايير المهنية للشركة. / The influencer commits to providing the agreed content as per professional standards.</div>` + sig2,

    // Medical
    license_check: h("التحقق من صلاحية الترخيص","License Validity Check") + tbl(row("الاسم","Name",data.empName)+row("رقم الترخيص","License No.",data.licenseNo)+row("تاريخ الانتهاء","Expiry Date",data.expiryDate)) + sig3,
    patient_conf: h("سرية بيانات المرضى","Patient Confidentiality") + pledgeText("أتعهد بالحفاظ على سرية بيانات المرضى وعدم تسريبها.","I pledge to maintain patient data confidentiality.") + sig2,
    shift_roster: h("جدول المناوبات","Shift Roster") + tbl(row("الاسم","Name",data.empName)+row("الفترة","Shift",data.shiftType)+row("من","From",data.startTime)+row("إلى","To",data.endTime)) + sig3,
    incident_report: h("تقرير حادثة / خطأ طبي","Incident Report") + tbl(row("التاريخ","Date",data.date)+row("الموقع","Location",data.location)) + box("الوصف","Description",data.description) + sig3,
    infection_allow: h("نموذج بدل عدوى","Infection Allowance") + tbl(row("الاسم","Name",data.empName)+row("القسم","Dept",data.dept)+row("المبلغ","Amount",data.amount)) + sig3,

    // Financial
    fin_disclosure: h("إقرار الذمة المالية","Financial Disclosure") + box("الأصول","Assets",data.assets) + sig2,
    cash_custody: h("استلام عهدة نقدية","Cash Custody Form") + tbl(row("الاسم","Name",data.empName)+row("المبلغ","Amount",data.amount)) + sig3,
    aml_form: h("إقرار مكافحة غسيل الأموال","AML Compliance") + pledgeText("أقر بالتزامي بكافة قوانين مكافحة غسيل الأموال.","I confirm compliance with AML laws.") + sig2,
    cash_count: h("محضر جرد الصندوق","Cash Count Record") + tbl(row("المسؤول","Custodian",data.empName)+row("المبلغ الفعلي","Actual Cash",data.amount)) + sig3,

    // Construction
    ppe_receipt: h("استلام مهمات السلامة (PPE)","PPE Receipt") + box("المهمات المستلمة","Items Received",data.items) + sig3,
    site_permit: h("تصريح دخول موقع","Site Access Permit") + tbl(row("الاسم","Name",data.empName)+row("الموقع","Site",data.siteName)) + sig3,
    work_injury: h("نموذج إصابة عمل","Work Injury Report") + box("تفاصيل الإصابة","Injury Details",data.details) + sig3,
    site_transfer: h("نقل موظف بين المواقع","Site Transfer Form") + tbl(row("من","From",data.fromSite)+row("إلى","To",data.toSite)) + sig3,

    // Retail
    uniform_recv: h("استلام الزي الرسمي","Uniform Receipt") + box("القطع المستلمة","Items",data.items) + sig3,
    inventory_short: h("إقرار عجز المخزون","Inventory Shortage Ack.") + tbl(row("المبلغ","Amount",data.amount)) + sig3,
    health_card: h("متابعة الفحص الصحي","Health Card Tracker") + tbl(row("تاريخ الفحص","Check Date",data.checkDate)) + sig3,

    // Tech
    ip_assign: h("اتفاقية الملكية الفكرية","IP Assignment") + pledgeText("أقر بأن جميع الابتكارات أثناء العمل هي ملك للشركة.","I acknowledge that all innovations during work belong to the company.") + sig2,
    remote_policy: h("سياسة العمل عن بعد","Remote Work Policy") + box("الشروط","Terms",data.terms) + sig2,
    cyber_pledge: h("تعهد أمن المعلومات","Cybersecurity Pledge") + pledgeText("أتعهد بالالتزام بسياسات أمن المعلومات.","I pledge to follow cybersecurity policies.") + sig2,
    remote_work_aggr: h("اتفاقية العمل عن بعد","Remote Work Agreement") +
      tbl(row("اسم الموظف","Employee Name",data.empName)+row("رقم الهوية","ID",data.empId)+row("المسمى","Title",data.jobTitle)+row("أيام العمل","Work Days",data.workDays)+row("ساعات التواجد","Presence",data.presence)+row("تاريخ البدء","Start Date",data.startDate)) +
      box("معايير الإنتاجية","Productivity Metrics",data.productivity) +
      `<div style="font-size:10px;color:#777;margin-bottom:14px;line-height:1.7;">يلتزم الموظف بالتواجد الرقمي خلال الساعات المحددة وتقديم تقارير الإنتاجية المتفق عليها. / The employee commits to digital presence during specified hours and providing agreed productivity reports.</div>` + sig2,
    tech_nda: h("اتفاقية سرية المعلومات التقنية","Tech Confidentiality Agreement") + pledgeText("أتعهد بالحفاظ على سرية الأكواد البرمجية والبيانات التقنية للشركة.","I pledge to maintain the confidentiality of the company's source code and technical data.") + sig2,
    food_safety: h("نموذج فحص سلامة الغذاء","Food Safety Inspection") +
      tbl(row("المفتش","Inspector",data.inspector)+row("الموقع","Location",data.location)+row("الحالة","Status",data.status)) +
      box("الملاحظات","Notes",data.notes) + sig2,
  };

  if (formId === "freeform") {
    return `<div style="direction:rtl;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:3px solid ${c};margin-bottom:18px;">
        <div>${logoHtml}<div style="font-size:9px;color:#999;letter-spacing:1px;margin-top:2px;">${company.tagline||""}</div></div>
        <div style="text-align:left;font-size:10px;color:#555;line-height:1.9;"><div>${company.address}</div><div>${company.phone} | ${company.email} | ${company.website}</div></div>
      </div>
      <div style="text-align:center;margin-bottom:18px;"><div style="font-size:17px;font-weight:900;color:${c};border:2px solid ${c};display:inline-block;padding:6px 26px;border-radius:4px;">${data.subject||"الموضوع / Subject"}</div><div style="font-size:10px;color:#aaa;margin-top:4px;">${tAr} | ${tEn}</div></div>
      ${data.recipient?`<div style="margin-bottom:14px;font-size:12px;"><strong>إلى / To:</strong> ${data.recipient}</div>`:""}
      <div style="min-height:200px;border:1px solid #eee;padding:14px;background:#fafafa;border-radius:4px;font-size:12px;line-height:1.9;white-space:pre-wrap;">${data.body||""}</div>
      <div style="display:flex;justify-content:flex-end;margin-top:28px;"><div style="text-align:center;"><div style="border-top:1px solid #555;width:200px;padding-top:5px;font-size:10px;color:#444;">${data.signedBy||"التوقيع / Signature"}<br><span style="color:#aaa;">${company.name}</span></div></div></div>
      ${ftr}`;
  }

  return hdr + (bodies[formId] || "<p>النموذج غير متاح / Form not found</p>") + ftr;
}
