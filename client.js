(function translate() {
  //if (window.translatedTo) return;
  //var lang = navigator.language.split('-')[0] + '.json';
  var lang = 'ru.json';
  if (!localStorage[lang])
    localStorage[lang] = '{}';
  var dict = JSON.parse(localStorage[lang]);
  
  var req = [lang];
  [].slice.call(document.querySelectorAll('body *')).forEach(function(e) {
    if (!e.innerText.trim().length || e.innerText.length > 60 || e.tagName == 'tr')
      return;
    try {
      e.innerText = dict[e.innerText] || (req.push(e.innerText) && e.innerText);
    } catch (e) {
    }
  });
  window.translatedTo = lang;
  
  console.log('needs', req.length - 1);
  if (req.length < 2)
    return;
  
  var x = new XMLHttpRequest;
  x.open('POST', 'http://localhost/translate', true);
  x.send(JSON.stringify(req));
  x.onload = function(r) {
    var resp = JSON.parse(r.target.responseText);
    console.log(resp);
    for (i in resp)
      dict[i] = resp[i];
    localStorage[lang] = JSON.stringify(dict);
  }
})();
