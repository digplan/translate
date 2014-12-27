translate
=========

Translate any page.  Setup your own server which uses MS Translator service to translate text.       
http://www.microsoft.com/translator/get-started.aspx    

A single client JS script translates the text on the page.

test.html
````
<script src='/client.js'></script>

<script>
  // set lang.json, or will get language from browser settings
  lang = 'es.json';
</script>

<div>Hi there, I am a test</div>
````

Caches on server (languages directory), and client (localStorage)    
