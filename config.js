/* ============================================================
   Having Corp. — site configuration
   Edit this file to update keys / IDs / company info.
   NOTE: only PUBLIC values belong here (this file is served to
   the browser). Never put secret/back-end keys here.
   ============================================================ */
window.HAVING_CONFIG = {
  // --- form / analytics (replace placeholders when available) ---
  web3formsAccessKey: "86192900-6124-4bd4-af5a-262133779491",   // get from https://web3forms.com (free)
  gaMeasurementId:    "G-EL31DFRHN3",      // Google Analytics 4 Measurement ID

  // --- contact (language-independent) ---
  contactEmail:  "having@having.co.kr",
  businessRegNo: "528-86-01549",

  // --- language-specific company info (used by footer / legal / forms) ---
  i18n: {
    en: {
      companyName:    "Having Corp.",
      companyAddress: "B-519, 338, Gwanggyojungang-ro, Suji-gu, Yongin-si, Gyeonggi-do, 16942, Republic of Korea"
    },
    ko: {
      companyName:    "해빙 주식회사",
      companyAddress: "경기도 용인시 수지구 광교중앙로 338, B동 519호 (광교우미뉴브) 16942"
    }
  }
};

/* helper: current-language company info */
window.havingConfigL10n = function(){
  var lang = (document.documentElement.getAttribute('lang') || 'en');
  var c = window.HAVING_CONFIG.i18n[lang] || window.HAVING_CONFIG.i18n.en;
  return c;
};
