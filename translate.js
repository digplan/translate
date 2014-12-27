var MsTranslator = require('mstranslator');
var client = new MsTranslator({
  client_id: "JSI18N",
  client_secret: "znqba26ZqX0xUFhzfchAJ/elq1c4XW2FUOJ+K2KmP+o="
}, true);

var fs = require('fs');
var dir = './languages';
var data = {};

if (!fs.existsSync(dir))
  fs.mkdir(dir);

var files = fs.readdirSync(dir);
files.forEach(function(file) {
  data[file] = require(dir + '/' + file);
});
console.log(data)

function getNewTranslation(text, lang, cb) {
  console.log('requesting from ms')
  client.translate({
    text: text,
    to: lang
  }, function(e, data) {
    if (e) throw e;
    cb(data);
  });
}

function translationRequested(lang, words, cb) {
  var path = dir + '/' + lang;

  if (!data[lang]) {
    console.log('no lang exist, creating')
    fs.writeFileSync(path, '{}');
    data[lang] = {};
  }

  var len = words.length;
  var resp = {};

  words.forEach(function(word) {
    console.log('checking for', data[lang][word])
    if (data[lang][word]) {
      resp[word] = data[lang][word];
      console.log('found');
      len--;
    } else {
      console.log('not found');
      getNewTranslation(word, lang.replace('.json', ''), function(d) {
        if (d) {
          resp[word] = d;
          data[lang][word] = d;
        }
        len--;
      });
    }
  });

  setTimeout(function() {
    cb(resp);
    console.log(resp)
    fs.writeFileSync(path, JSON.stringify(data[lang], null, 2));
  }, 4000);

}

function handleRequest(r, s, d){
  if(!r.url.match('translate')) return s.end('');
  s.setHeader('Access-Control-Allow-Origin', '*');
  d = JSON.parse(d);

  translationRequested(d.shift(), d, function(resp){
    console.log('respong', resp)
    s.end(JSON.stringify(resp));
  })
}

require('http').createServer(function(r, s) {
  var d = '';
  r.on('data', function(chunk) {
    d += chunk.toString();
  });
  r.on('end', function() {
    handleRequest(r, s, d);
  });
}).listen(80);
