var MsTranslator = require('mstranslator');
var config = require('./config.json');

var client = new MsTranslator({
  client_id: config.client_id,
  client_secret: config.client_secret
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
if(process.env.debug) console.log(data)

function getNewTranslation(text, lang, cb) {
  if(process.env.debug) console.log('requesting from msft')
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
    if(process.env.debug) console.log('no lang exist, creating')
    fs.writeFileSync(path, '{}');
    data[lang] = {};
  }

  var len = words.length;
  var resp = {};

  words.forEach(function(word) {
    console.log('checking for', data[lang][word])
    if (data[lang][word]) {
      resp[word] = data[lang][word];
      if(process.env.debug) console.log('found');
      len--;
    } else {
      if(process.env.debug) console.log('not found');
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
    if(process.env.debug) console.log('saving', path, data[lang]);
    fs.writeFileSync(path, JSON.stringify(data[lang], null, 2));
  }, 4000);

}

var cli = fs.readFileSync('./client.js').toString();
var test = fs.readFileSync('./test.html').toString();

function handleRequest(r, s, d){
  if(r.url.match('client.js')) 
    return s.end(cli.replace('$HOST', 'http://' + r.headers.host));
  if(r.url.match('test.html')) 
    return s.end(test);
  if(!r.url.match('translate')) return s.end('');
  s.setHeader('Access-Control-Allow-Origin', '*');
  d = JSON.parse(d);

  translationRequested(d.shift(), d, function(resp){
    if(process.env.debug) console.log('responding', resp)
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
}).listen(process.env.port || 80);
