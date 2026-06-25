/* ============================================================
   Having Corp. — site configuration
   Edit this file to update keys / IDs / company info.
   NOTE: only PUBLIC values belong here (this file is served to
   the browser). Never put secret/back-end keys here.
   ============================================================ */
window.HAVING_CONFIG = {
  // --- form / analytics (replace placeholders when available) ---
  web3formsAccessKey: "c638c719-12c8-4e28-bdb9-2fbd026a1ff2",   // get from https://web3forms.com (free)
  gaMeasurementId:    "G-EL31DFRHN3",      // Google Analytics 4 Measurement ID

  // --- contact (language-independent) ---
  contactEmail:  "having@having.co.kr",
  businessRegNo: "528-86-01549",

  // --- language-specific company info (used by footer / legal / forms) ---
  i18n: {
    en: {
      companyName:    "Having Corp.",
      companyAddress: "8F R829, City Plaza, 191 Dongbaekjungang-ro, Giheung-gu, Yongin-si, Gyeonggi-do, Republic of Korea"
    },
    ko: {
      companyName:    "해빙 주식회사",
      companyAddress: "경기도 용인시 기흥구 동백중앙로 191, 8층 R829호(중동)"
    }
  }
};

/* helper: current-language company info */
window.havingConfigL10n = function(){
  var lang = (document.documentElement.getAttribute('lang') || 'en');
  var c = window.HAVING_CONFIG.i18n[lang] || window.HAVING_CONFIG.i18n.en;
  return c;
};
