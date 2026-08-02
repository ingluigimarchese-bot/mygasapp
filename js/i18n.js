async function loadLanguage(lang){
  const base = location.pathname.includes('/modules/') ? '../lang/' : 'lang/';
  const res = await fetch(base + lang + '.json');
  const dict = await res.json();
  applyTranslations(dict);
  document.documentElement.lang = lang;
  window.currentTranslations = dict;
  localStorage.setItem('mygasapp_lang', lang);
  const sel = document.getElementById('language-switcher');
  if(sel) sel.value = lang;
}
function t(key,fallback=''){
  const dict = window.currentTranslations || {};
  return key.split('.').reduce((o,k)=>o&&o[k],dict) || fallback || key;
}
function applyTranslations(dict){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const value = key.split('.').reduce((o,k)=>o&&o[k],dict);
    if(value) el.textContent = value;
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  const saved = localStorage.getItem('mygasapp_lang') || 'it';
  loadLanguage(saved);
  const sel = document.getElementById('language-switcher');
  if(sel){
    sel.addEventListener('change',e=>loadLanguage(e.target.value));
  }
});
