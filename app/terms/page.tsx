
'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
        <Link href="/" className="text-brand-accent hover:text-white mb-8 inline-flex items-center gap-2 transition-colors font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          חזרה לדף הבית
        </Link>
        
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-3xl md:text-4xl font-black text-white">תנאי שימוש Realty-Pages.com</h1>
        </div>
        
        <p className="text-slate-400 mb-8 font-medium">עדכון אחרון: 19.01.2025</p>

        <div className="space-y-8 text-slate-300 leading-loose text-right">
          <section>
            <p>
              ברוכים הבאים ל-Realty-Pages (להלן: "השירות"). השימוש באתר ובאפליקציה כפוף לתנאים המפורטים להלן. בעצם השימוש בשירות, אתה (להלן: "המשתמש") מצהיר כי קראת, הבנת והסכמת לתנאים אלו במלואם.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">1.</span> השירות
            </h2>
            <p>
              Realty-Pages מספקת פלטפורמה טכנולוגית ליצירה, עיצוב ואחסון של דפי נחיתה המיועדים לתחום הנדל"ן. החברה רשאית לשנות, להוסיף או להסיר תכונות מהשירות בכל עת.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">2.</span> חשבון משתמש ואבטחה
            </h2>
            <ul className="list-disc list-inside space-y-3 pr-4">
              <li>השימוש בשירות דורש הרשמה ופתיחת חשבון.</li>
              <li>המשתמש אחראי באופן בלעדי לשמירה על סודיות פרטי ההתחברות ועל כל פעולה שתבוצע תחת חשבונו.</li>
              <li>יש לספק מידע מדויק ועדכני בלבד בעת ההרשמה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">3.</span> תוכן משתמש וקניין רוחני
            </h2>
            <ul className="list-disc list-inside space-y-3 pr-4">
              <li><strong>התוכן שלך:</strong> כל מידע, טקסט, תמונה או נתון שתעלה לדפי הנחיתה (להלן: "תוכן משתמש") נשאר בבעלותך המלאה. המשתמש מצהיר כי יש לו את כל הזכויות והאישורים הנדרשים להשתמש בתוכן זה.</li>
              <li><strong>הקניין שלנו:</strong> כל הזכויות בשירות, לרבות הקוד, העיצוב (כולל התבניות), סימני המסחר והטכנולוגיה, שייכים בלעדית ל-Realty-Pages. אין להעתיק, לשכפל או להפיץ חלקים מהשירות ללא אישור מראש.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">4.</span> הגבלות שימוש
            </h2>
            <p className="mb-2">חל איסור מוחלט על:</p>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>שימוש בשירות למטרות לא חוקיות, מטעות או פוגעניות.</li>
              <li>העלאת תוכן הכולל וירוסים, קוד זדוני או תוכנות המיועדות לפגוע בשירות.</li>
              <li>ביצוע הנדסה לאחור (Reverse Engineering) או ניסיון לשבש את פעילות השרתים.</li>
              <li>יצירת דפי נחיתה המקדמים הונאות נדל"ן או מידע כוזב.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">5.</span> תשלומים וביטולים
            </h2>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>השימוש בחלק מהשירותים כרוך בתשלום דמי מנוי בהתאם למסלול שנבחר.</li>
              <li>החברה שומרת לעצמה את הזכות לעדכן מחירים בכל עת, תוך מתן הודעה מראש.</li>
              <li>מדיניות הביטולים והחזרים כפופה לחוק הגנת הצרכן הישראלי ותפורט בנפרד בתהליך הרכישה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">6.</span> הגבלת אחריות (Disclaimer)
            </h2>
            <ul className="list-disc list-inside space-y-3 pr-4">
              <li>השירות ניתן כפי שהוא ("As-Is"). Realty-Pages אינה מתחייבת שהשירות יהיה חסין מתקלות או זמין בכל עת.</li>
              <li>החברה אינה אחראית לתוצאות העסקיות (כגון כמות לידים או מכירות) הנובעות מהשימוש בדפי הנחיתה.</li>
              <li>החברה אינה אחראית לכל נזק עקיף, תוצאתי או מקרי שייגרם למשתמש כתוצאה מהשימוש בשירות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">7.</span> שיפוי
            </h2>
            <p>
              המשתמש מתחייב לשפות את החברה, עובדיה או מי מטעמה בגין כל תביעה או דרישה מצד שלישי הנובעת מהפרת תנאים אלו או מתוכן שהועלה על ידו.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">8.</span> סיום התקשרות
            </h2>
            <p>
              החברה רשאית להשעות או לחסום גישה למשתמש המפר את תנאי השימוש, ללא הודעה מראש ובכפוף לשיקול דעתה הבלעדי.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">9.</span> סמכות שיפוט
            </h2>
            <p>
              על תנאים אלו יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל הקשור להסכם זה תהיה לבתי המשפט המוסמכים בעיר תל אביב.
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Realty-Pages.com - כל הזכויות שמורות.
        </div>
      </div>
    </div>
  );
}
