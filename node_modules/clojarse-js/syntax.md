# Syntax resources #

 - [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
 - [the Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java)



# Structural parsing #

## Tokens ##

Definitions:

   - macro character: one of ``` ";@^`~()[]{}\'%# ```
   
   - terminating macro character: one of ``` ";@^`~()[]{}\ ```

### Comment ###

   - open: `/(;|#!)/`
   - value: `/[^\n\r\f]*/`

### Whitespace ###

   - value: `/[ \t,\n\r\f]+/`

Also, everything else that Java's `Character.isWhitespace` considers to be whitespace.
See http://docs.oracle.com/javase/7/docs/api/java/lang/Character.html#isWhitespace(int).

### Number ###

basically, if it starts with a digit, or the combination of +/- followed by a
digit, it's a number.

See http://docs.oracle.com/javase/7/docs/api/java/lang/Character.html#isDigit(int)
for what is considered to be a digit.

   - sign:  `/[-+]?/`
   - first: `/\d/`
   - rest: `(not1  ( whitespace  |  macro ) )(*)`

### Ident ###

   - first:  `(not1  ( whitespace  |  macro ) )  |  '%'`
   - rest:  `(not1  ( whitespace  |  terminatingMacro ))(*)`

Why does this include `%...`?  
Because: outside of a `#()` function, `%...` is just a normal ident.

### Character ###

   - open: `\\`
   - first: `.`
   - rest: `(not1  ( whitespace  |  terminatingMacro ) )(*)`

### String ###

   - open: `"`
   - body: `/([^\\"]|\\.)*/` -- `.` includes newlines
   - close: `"`

This is only approximately correct.  how could it go wrong?

### Regex ###

   - open: `#"`
   - body: `/([^\\"]|\\.)*/` -- `.` includes newlines
   - close: `"`

### Punctuation ###

 - `(`
 - `)`
 - `[`
 - `]`
 - `{`
 - `}`
 - `@`
 - `^`
 - `'`
 - ``` ` ```
 - `~@`
 - `~`
 - #-dispatches
   - `#(`
   - `#{`
   - `#^`
   - `#'`
   - `#=`
   - `#_`
   - `#<` -- ??? unreadable reader ???
   - error: `#` followed by anything else (except for `#!` and `#"`)

## Hierarchical forms ##

Whitespace, comments and discard forms (`#_`) can appear in any amount
between tokens.

### Discard ###

   - open: `#_`
   - value: `Form`

### List ###

   - open: `(`
   - body: `Form(*)`
   - close: `)`

### Vector ###

   - open: `[`
   - body: `Form(*)`
   - close: `]`

### Table ###

   - open: `{`
   - body: `Form(*)`
   - close: `}`

### Quote ###

   - open: `'`
   - value: `Form`

### Deref ###

   - open: `@`
   - value: `Form`

### Unquote ###

   - open: `~`
   - value: `Form`

### Unquote splicing ###

   - open: `~@`
   - value: `Form`

### Syntax quote ###

   - open: ``` ` ```
   - value: `Form`

### Function ###

   - open: `#(`
   - body: `Form(*)`
   - close: `)`

### Set ###

   - open: `#{`
   - body: `Form(*)`
   - close: `}`

### Meta ###

   - open: `'^'  |  '#^'`
   - metadata: `Form`
   - value: `Form`

### Eval ###

   - open: `#=`
   - value: `Form`

### Var ###

   - open: `#'`
   - value: `Form`

### Unreadable ###

   - open: `#<`
   - value: ??????????

### Other dispatch ###

   - open: `/#./`
   - value: ???????????

### Form ###

     String  |  Number  |  Char  |  Ident   |  Regex     |
     List    |  Vector  |  Set   |  Table   |  Function  |
     Deref   |  Quote   |  Unquote  |  UnquoteSplicing   |
     SyntaxQuote  |  Meta  |  Eval  |  Var

Order in which they're tried does seem to be important for some cases, since
a given input might match multiple patterns:

  - Number before Ident

### Clojure ###

    Form(*)



# Token parsers #

Goal of this phase: determine the internal structure of the number, ident,
char, string, and regex tokens

## String ##

Syntax

   - escape
   
       - open: `\`

       - error: next char matches `/[^btnfr\\"0-7u]/`
   
       - value
       
         - simple
           - `/[btnfr\\"]/`

         - octal
           - `/[0-7]{1,3}/`
           - stops when: 3 octal characters parsed, or whitespace hit,
             or macro character hit
           - error: digit is 8 or 9
           - error: hasn't finished, but encounters character which is not
           whitespace, octal, or macro

         - unicode
           - `/u[0-9a-zA-Z]{4}/`
           - error: less than four hex characters found

   - `/[^\\"]/`: plain character (not escaped)

     - what about ?? unprintable chars (actual newline, etc.) ??

Notes

   - macro and whitespace characters have special meaning inside strings:
     they terminate octal and unicode escape sequences
   - octal and unicode escapes use Java's `Character.digit` and
     `Character.isDigit`, so they seem to work on other forms of digits,
     such as u+ff13

            "\uＡＢＣＤ" is the 1 character string "ꯍ"
            // b/c each of ＡＢＣＤ is a digit according to Character.digit(ch, 16)


## Regex ##

Syntax
 
   - real escape: `/\\[\\"]/`
   - fake escape: `/\\[^\\"]/`
     so-called because both characters get included in output

Notes


## Number ##

Syntax

   - ratio

       - sign: `/[-+]?/`
       - numerator: `/[0-9]+/`
       - slash: `/`
       - denominator: `/[0-9]+/`

   - float

       - sign: `/[-+]?/`
       - int: `/[0-9]+/`
       - decimal (optional)
           - dot: `.`
           - int: `/[0-9]*/`
       - exponent (optional)
           - e: `/[eE]/`
           - sign: `/[+-]?/`
           - power: `/[0-9]+/`
       - suffix
           - `/M?/`

   - integer

       - sign: `/[+-]?/`
       - body
          - base16
              - `/0[xX]hex+/
              - where `hex` is `/[0-9a-zA-Z]/`
          - base8 (not sure about this)
              - `/0[0-7]+/`
              - error: `08`
          - base(2-36)
              - `/[1-9][0-9]?[rR][0-9a-zA-Z]+/`
          - base10
              - `/[1-9][0-9]*/`
       - bigint suffix: `/N?/`

Notes

   - apparently, can't apply bigint suffix to base(2-36)


## Char ##

   - open: `\`
   
   - value
      - long escape
        - `newline`
        - `space`
        - `tab`
        - `backspace`
        - `formfeed`
        - `return`

      - unicode escape -- *not* identical to string's unicode escape
        - `XXXX` where X is a hex character
        - hex characters defined by Java's `Character.digit(<some_int>, 16)`
          - includes some surprises!

      - octal escape
        - `oX`, `oXX`, or `oXXX` where X is an octal character
        - octal characters defined by Java's `Character.digit(<som_int>, 8)`
          - includes surprises!

      - simple character (not escaped)
        - any character, including `n`, `u`, `\`, an actual tab, space, newline
        - what about unprintable characters?


## Ident ##

Syntax

   - special errors
     - `::` anywhere but at the beginning
     - if it matches `/([:]?)([^\d/].*/)?(/|[^\d/][^/]*)/`, and:
       - `$2 =~ /:\/$/` -> error
       - `$3 =~ /:$/` -> error

   - value
     - reserved
       - `nil`
       - `true`
       - `false`

     - not reserved
        - type: starts with:
          - `::` -- auto keyword
          - `:`  -- keyword
          - else -- symbol

        - namespace (optional)
          - `/[^/]+/`
          - `/`
       
        - name
          - `/.+/`
   
   - code used to verify against implementation:
   
        (fn [my-string]
          (let [f (juxt type namespace name)]
            (try 
              (f (eval (read-string my-string)))
              (catch RuntimeException e 
                (.getMessage e)))))

