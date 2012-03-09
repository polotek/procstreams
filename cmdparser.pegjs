{
    var parsedArgs = [];
    var collectRest = function(rest) {
      var chars = ''
        tuple = null;
      for(var i = 0; i < rest.length; i++) {
        tuple = rest[i];
        chars += tuple[0] + tuple[1];
      }
      return chars;
    }
}
start
    = args { return parsedArgs; }

args
    = arg (_ arg)*

arg
    = chars:chars { parsedArgs.push(chars); }
    / string:sgl_string { parsedArgs.push(string); }
    / string:dbl_string { parsedArgs.push(string); }

sgl_string
    = "'" "'"
  / "'" chars:chars rest:(_ chars)* "'" { return chars + collectRest(rest); }

dbl_string
  = '"' '"' _             { return "";    }
  / '"' chars:chars rest:(_ chars)* '"' { return chars + collectRest(rest); }

chars
  = chars:char+ { return chars.join(""); }

char
  = [^'"\\\0-\x1F\x7f ]
  / "\\'"  { return "'";  }
  / '\\"'  { return '"';  }
  / "\\\\" { return "\\"; }

_ "whitespace"
    = [ \t\r\n\f]+
