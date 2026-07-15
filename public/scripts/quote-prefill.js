/* Reflections Productions — quote-prefill.js
   Ported verbatim from agl-reflections-website/quote.html lines 272-283.
   Reads ?date=/?location=/?attendance= query params (set by the homepage's
   "Is Your Date Still Open?" DateCheckForm GET submit to /quote.html) and
   pre-fills the matching quote-form fields, then scrolls the form into view
   if any params were present. No dependencies. */
(function prefillFromParams(){
  var p = new URLSearchParams(location.search);
  var map = {date:'[name="date"]', location:'[name="location"]', attendance:'[name="attendance"]'};
  Object.keys(map).forEach(function(k){
    var el = document.querySelector('.quote-form ' + map[k]);
    if (el && p.get(k)) { el.value = p.get(k);
      if (el.tagName==='SELECT') { [...el.options].forEach(function(o){ if(o.text===p.get(k)) el.value=o.value||o.text; }); } }
  });
  if ([...p.keys()].length) { var f=document.querySelector('.quote-form'); if(f) f.scrollIntoView(); }
})();
