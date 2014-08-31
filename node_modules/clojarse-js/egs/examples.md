# Structural parsing #

## Tokens ##

### Comment ###

### Whitespace ###

### Number ###

yes:

    4abc
    4
    +3
    
no:

    +

### Ident ###

### Character ###

### String ###

### Regex ###

### Punctuation ###

## Hierarchical forms ##

### Discard ###

### List ###

### Vector ###

### Table ###

### Quote ###

### Deref ###

### Unquote ###

### Unquote splicing ###

### Syntax quote ###

### Function ###

### Set ###

### Meta ###

### Eval ###

### Var ###

### Unreadable ###

### Other dispatch ###

### Form ###

### Clojure ###




# Token parsers #

## String ##

real newline
   
    (= "\n" "\
    ")
   
octal escapes
   
    "\0"
    "\10"
    "\3\3"
    "\232"

error octal escapes:

    "\9"
    "\400"
    "\3z"


## Regex ##


## Number ##

integer: yes

    0
    +0 
    -0
    34N     ; base 10
    0xabcN  ; base 16
    +007    ; base 8
    36rabcz ; custom radix

integer: no

    01238  

float: yes

    0.
    0.0000
    3e0
    3e-0
    5.e-4

float: no

    .7
    .7e-4
   
ratio: yes

    3/4
    -3/4
    09/8  ; surprising because `09` **is** an error

ratio: no

    3/-4
    3/ 4



## Char ##

corner case yes:

    [\"[]]      ; `[` is a terminating macro, so the char is `\"`.

corner case no: 

    [\"#(vector)]   ; `(` is the first terminating macro (`#` is 
                    ; not a terminating macro), 
                    ; and `\"#` is not a valid character

yes:

    \u0041
    \u
    \o123
    \o
    \o7
    \o007
    \tab

no:

    \u0
    \o400
    \o8
    \o3777
    \tabs



## Symbol/keyword/autokeyword ##

yes:

    :abc                ; keyword, (nil, abc)
    ::abc               ; auto keyword, (nil, abc)
    abc                 ; symbol, (nil, abc)
    x////x              ; symbol, (x, ///x)
    q/a/b               ; symbol, (q, a/b)
    qa                  ; symbol, (nil, qa)
    ::stuff.core/def    ; auto keyword, (stuff.core, def)
    :8/abc              ; keyword, (8, abc)
    :q/a/b              : keyword, (q, a/b)
    clojure.core//      ; symbol, (clojure.core, /)
    /                   ; symbol, (nil, /)
    %234                ; symbol, (nil, %234)

no:

    abc::def
    :::abc
    ////
    /abc
    :/abc
    ::8/abc
    :qrs/
    /ab

