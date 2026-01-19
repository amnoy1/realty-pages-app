
'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
        <Link href="/" className="text-brand-accent hover:text-white mb-8 inline-flex items-center gap-2 transition-colors font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          חזרה לדף הבית
        </Link>
        
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-3xl md:text-4xl font-black text-white">מדיניות פרטיות Realty-Pages.com</h1>
        </div>
        
        <p className="text-slate-400 mb-8 font-medium">עדכון אחרון: 19.01.2025</p>

        <div className="space-y-8 text-slate-300 leading-loose text-right">
          <section>
            <p>
              ברוכים הבאים ל-Realty-Pages (להלן: "השירות" או "החברה"). אנו מכבדים את פרטיותך ומחויבים להגן על המידע האישי של המשתמשים שלנו. מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלך בעת השימוש במחולל דפי הנחיתה שלנו.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">1.</span> המידע שאנו אוספים
            </h2>
            <p className="mb-2">אנו אוספים מידע בכמה דרכים:</p>
            <ul className="list-disc list-inside space-y-3 pr-4">
              <li><strong>מידע שאתה מספק לנו:</strong> בעת הרשמה לשירות, אנו אוספים פרטים כגון שם, כתובת אימייל, מספר טלפון ופרטי התחברות.</li>
              <li><strong>תוכן המשתמש:</strong> מידע המועלה על ידך לצורך יצירת דפי נחיתה (תמונות נכסים, תיאורי נדל"ן, פרטי קשר של סוכנים).</li>
              <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, נתוני שימוש בתוך האפליקציה ומידע שנאסף באמצעות עוגיות (Cookies) לצורך שיפור חוויית המשתמש.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">2.</span> כיצד אנו משתמשים במידע
            </h2>
            <p className="mb-2">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>אספקת שירותי מחולל דפי הנחיתה ותפעולם.</li>
              <li>שיפור וייעוץ אישי של חוויית המשתמש.</li>
              <li>שליחת עדכונים, הודעות מערכת ותכנים שיווקיים (ניתן להסיר את עצמך מרשימת התפוצה בכל עת).</li>
              <li>ניתוח סטטיסטי לשיפור ביצועי המערכת.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">3.</span> שיתוף מידע עם צדדים שלישיים
            </h2>
            <p className="mb-4">אנו לא מוכרים או משכירים את המידע האישי שלך לצדדים שלישיים. אנו עשויים לשתף מידע רק במקרים הבאים:</p>
            <ul className="list-disc list-inside space-y-3 pr-4">
              <li><strong>ספקי שירות:</strong> כגון שירותי אחסון ענן (AWS/Google Cloud/Facebook) או ספקי סליקה, או ספקי תוכן לצורך תפעול השירות בלבד.</li>
              <li><strong>דרישה משפטית:</strong> במידה ונידרש לכך על פי חוק או צו בית משפט.</li>
              <li><strong>הגנה על זכויות:</strong> במקרה של הפרת תנאי השימוש או הגנה על בטיחות המשתמשים.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">4.</span> אבטחת מידע
            </h2>
            <p>
              אנו מיישמים אמצעי אבטחה טכנולוגיים וארגוניים מתקדמים כדי להגן על המידע שלך מפני גישה בלתי מורשית, אובדן או שינוי. עם זאת, יש לזכור כי אף מערכת אינה חסינה לחלוטין.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">5.</span> זכויות המשתמש
            </h2>
            <p>
              זכותך לבקש לעיין במידע שנאסף עליך, לתקן אותו או לבקש את מחיקתו מהמערכת שלנו ("הזכות להישכח"). לביצוע בקשות אלו, ניתן לפנות אלינו בכתובת המייל המופיעה מטה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">6.</span> עוגיות (Cookies)
            </h2>
            <p>
              האתר משתמש בעוגיות כדי לזהות אותך בכניסות חוזרות ולנתח תעבורה. באפשרותך לשנות את הגדרות הדפדפן שלך כדי לחסום עוגיות, אך הדבר עשוי לפגוע בתפקוד השירות.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">7.</span> שינויים במדיניות הפרטיות
            </h2>
            <p>
              אנו רשאים לעדכן מדיניות זו מעת לעת. הודעה על שינויים מהותיים תפורסם באתר או תישלח במייל למשתמשים רשומים.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-accent">8.</span> יצירת קשר
            </h2>
            <p className="mb-4">לכל שאלה בנושא פרטיות, ניתן לפנות אלינו בכתובות הבאות:</p>
            <div className="space-y-2 font-mono text-brand-accent">
                <p>Support@realty-pages.com</p>
                <p>amir@in-real.estate</p>
            </div>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Realty-Pages.com - כל הזכויות שמורות.
        </div>
      </div>
    </div>
  );
}
