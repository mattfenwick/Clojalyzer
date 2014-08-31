genhtml-js
=======

## Description ##

 - Model
   - nodes
     - name: `/^[a-zA-z]+$/`
     - attributes
       - unique names
     - children:  any number of nodes, comments, texts
   - text
     - value: `/^([^&<>"']|&(lt|gt|amp|quot|apos);)*$/`
   - attributes
     - name:  `/^[a-zA-z]+$/`
     - value:  `/^"([^&<>"']|&(lt|gt|amp|quot|apos);)*"$/`
       escaping
       single-quote delimiting?
       question:  what about empty or missing values?
   - comments
   - root
     - doctype: ?? any number of attribute names or strings?
     - children: any number of nodes, comments, texts
 
 - Serialization
   - significant whitespace
   - self-closing tags vs. open/close pairs

## A laundry list of aspects (some may not be implemented) ##

 - model
   - elements
   - attributes
   - comments
   - root node
   - text nodes
   - schema:  child nodes, attributes allowed
   - directives
     - `<!doctype html>`
   - processing instructions
   - cdata
   - document type declaration

 - serialization
   - escaping: structure of document must not be changeable through 
     serialization loopholes
     - `<` -> `&lt;`
     - amp, gt, apos (same as #x27 -- hex ??), quot
     - what is "replacement text" and what does it have to do with
       double escaping?
   - empty elements -- `<input />` versus open/close pairs: `<a></a>`
   - ?? sanitizing ??

 - syntax restrictions
   - elements
     - names:  [spec](http://www.xml.com/axml/target.html#NT-Name) for both
       element & attribute names
     - wikipedia: tag names can't include any of 
       `-.0123456789!"#$%&'()*+,/;<=>?@[\]^`{|}~`, or spaces 
   - attributes
     - names
     - unique names within an element
   - comments
     - no escaping (according to wikipedia)
     - can't have `--` inside a comment
   
 - (in)significant whitespace
   - `pre` vs `p`

