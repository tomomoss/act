var r={301:(r,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.keyword=void 0,e.keyword={additionOperator:"+",additionAssignmentOperator:"+=",andOperator:"&",assignmentOperator:"=",block:{closingTag:"}",openingTag:"{"},booleanLiteral:{false:"false",true:"true"},divisionOperator:"/",divisionAssignmentOperator:"/=",equalityOperator:"==",greaterThanOperator:">",greaterThanOrEqualOperator:">=",groupingOperator:{closingTag:")",openingTag:"("},inequalityOperator:"!=",lessThanOperator:"<",lessThanOrEqualOperator:"<=",lineFeed:"\n",minusOperator:"-",multiLineComment:{closingTag:"#>",openingTag:"<#"},multiplicationOperator:"*",multiplicationAssignmentOperator:"*=",notOperator:"!",nullLiteral:"null",orOperator:"|",plusOperator:"+",remainderOperator:"%",remainderAssignmentOperator:"%=",singleLineComment:"#",space:" ",stringLiteral:{doubleQuotationTag:'"',escapeSequence:"\\",singleQuotationTag:"'"},subtractionOperator:"-",subtractionAssignmentOperator:"-=",variable:"$"}},443:function(r,e){var o,n=this&&this.__extends||(o=function(r,e){return o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(r,e){r.__proto__=e}||function(r,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(r[o]=e[o])},o(r,e)},function(r,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=r}o(r,e),r.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)});Object.defineProperty(e,"__esModule",{value:!0}),e.TranspileError=void 0;var t=function(r){function e(e,o,n){var t=this.constructor,i=r.call(this,n)||this;return i.column=o,i.name=t.name,i.row=e,Object.setPrototypeOf(i,t.prototype),i}return n(e,r),e}(Error);e.TranspileError=t},215:(r,e,o)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.parse=void 0;var n=o(301),t=o(443),i=function(r){return""===(null==r?void 0:r.value.replace(/[0-9]/g,""))},a=function(r){return(null==r?void 0:r.value)===n.keyword.plusOperator||(null==r?void 0:r.value)===n.keyword.minusOperator};e.parse=function(r){for(u=0,l=r,p="";w();)c()||d()||v();return p="SETLOCAL\n"+(p="@ECHO OFF\n"+p),p+="EXIT /B 0\n"};var u,l,p,s=function(){for(var r,e,o,s,c=[],d=0,v=null===(r=l[u])||void 0===r?void 0:r.row;w();){var f=null;if(c.length>0&&(null===(e=c[c.length-1])||void 0===e?void 0:e.value)!==n.keyword.groupingOperator.openingTag&&(null===(o=l[u])||void 0===o?void 0:o.value)!==n.keyword.groupingOperator.closingTag){if((null==(s=l[u])?void 0:s.value)!==n.keyword.additionOperator&&(null==s?void 0:s.value)!==n.keyword.subtractionOperator&&(null==s?void 0:s.value)!==n.keyword.multiplicationOperator&&(null==s?void 0:s.value)!==n.keyword.divisionOperator&&(null==s?void 0:s.value)!==n.keyword.remainderOperator||l[u].row!==v)break;f=u,c.push(l[u]),u+=1}if(a(l[u])){if(null!==f&&l[u].row!==v)throw new t.TranspileError(l[f].row,l[f].column,l[f].value+"演算子の右辺被演算子が見つかりません。");c.push(l[u]),u+=1}if(null!==f&&!w())throw new t.TranspileError(l[f].row,l[f].column,l[f].value+"演算子の右辺被演算子が見つかりません。");if(i(l[u])){if(null!==f&&l[u].row!==v)throw new t.TranspileError(l[f].row,l[f].column,l[f].value+"演算子の右辺被演算子が見つかりません。");c.push(l[u]),u+=1}else if(l[u].value!==n.keyword.groupingOperator.openingTag){if(l[u].value!==n.keyword.groupingOperator.closingTag){if(null===f)break;throw new t.TranspileError(l[f].row,l[f].column,l[f].value+"演算子の右辺被演算子が見つかりません。")}if(null!==f&&l[u].row!==v)throw new t.TranspileError(l[f].row,l[f].column,l[f].value+"演算子の右辺被演算子が見つかりません。");d-=1,c.push(l[u]),u+=1}else{if(null!==f&&l[u].row!==v)throw new t.TranspileError(l[f].row,l[f].column,l[f].value+"演算子の右辺被演算子が見つかりません。");d+=1,c.push(l[u]),u+=1}}if(0===c.length)return!1;if(d>0)throw new t.TranspileError(c[c.length-1].row,c[c.length-1].column+c[c.length-1].value.length,"グループが閉じられていません。");p+="SET /A act.@exit=";for(var g=0,O=c;g<O.length;g++){var m=O[g];p+=m.value}return p+="\n",!0},c=function(){var r;return!!s()&&(l[u-1].row===(null===(r=l[u])||void 0===r?void 0:r.row)&&v(),!0)},d=function(){if(!w()||"echo"!==l[u].value)return!1;var r=l[u].index,e=l[u].row;if(u+=1,w()&&l[u].row===e){if(s()||v(),u>r+2&&l[u-1].value!==n.keyword.groupingOperator.closingTag)throw new t.TranspileError(l[r+1].row,l[r+1].column,"引数の数が不正です。");if(w()&&l[u].row===e)throw new t.TranspileError(l[u].row,l[u].column,"引数の数が不正です。");return p+="SET act.@argument1=%act.@exit%\nECHO %act.@argument1%\n",!0}return p+="ECHO;\n",!0},w=function(){return u<l.length},v=function(){if(void 0===l[u])throw new t.TranspileError(l[u-1].row,l[u-1].column,"予期しない字句です。");throw new t.TranspileError(l[u].row,l[u].column,"予期しない字句です。")}},411:(r,e,o)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.tokenize=void 0;var n=o(301),t=o(443),i=function(r){return"string"==typeof r?p.slice(u,u+r.length)===r:r.test(p.slice(u,u+1))};e.tokenize=function(r){for(a=1,u=0,l=1,p=r,s=[];x();)if(!(E()||f()||g()||m()||h()||k()||O()||c()||b()||y()||d()||T()||v()||w()))throw new t.TranspileError(l,a,"予期しない字句です。");return s};var a,u,l,p,s,c=function(){return!!i(n.keyword.additionOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.additionOperator}),_(n.keyword.additionOperator),!0)},d=function(){return!!i(n.keyword.divisionOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.divisionOperator}),_(n.keyword.divisionOperator),!0)},w=function(){for(var r={column:a,index:u,row:l,value:""};x()&&i(/[A-Za-z0-9_]/);){var e=p.slice(u,u+1);r.value+=e,_(e)}if(""===r.value)return!1;if(/[A-Z]/.test(r.value))throw new t.TranspileError(r.row,r.column,"関数名に使用できるのはアルファベットの小文字、半角数字、アンダースコア記号だけです。");return s.push(r),!0},v=function(){var r={column:a,index:u,row:l,value:""};if(i(n.keyword.groupingOperator.openingTag))r.value=n.keyword.groupingOperator.openingTag;else{if(!i(n.keyword.groupingOperator.closingTag))return!1;r.value=n.keyword.groupingOperator.closingTag}return s.push(r),_(r.value),!0},f=function(){return!!i(n.keyword.lineFeed)&&(_(n.keyword.lineFeed),!0)},g=function(){if(!i(n.keyword.singleLineComment))return!1;for(_(n.keyword.singleLineComment);x()&&!f();)_(p.slice(u,u+1));return!0},O=function(){return!!i(n.keyword.minusOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.minusOperator}),_(n.keyword.minusOperator),!0)},m=function(){if(!i(n.keyword.multiLineComment.openingTag))return!1;_(n.keyword.multiLineComment.openingTag);for(var r=!1;x();){if(i(n.keyword.multiLineComment.closingTag)){r=!0,_(n.keyword.multiLineComment.closingTag);break}_(p.slice(u,u+1))}if(!r)throw new t.TranspileError(l,a,"複数行コメントが閉じられていません。");return!0},y=function(){return!!i(n.keyword.multiplicationOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.multiplicationOperator}),_(n.keyword.multiplicationOperator),!0)},h=function(){for(var r={column:a,index:u,row:l,value:""};x()&&i(/[0-9.]/);){var e=p.slice(u,u+1);r.value+=e,_(e)}if(""===r.value)return!1;if(/0[0-9]/.test(r.value))throw new t.TranspileError(r.row,r.column,"数値リテラルの0埋めは許可されません。");if(/\./.test(r.value))throw new t.TranspileError(r.row,r.column,"数値リテラルで定義できるのは32bit整数だけです。");return s.push(r),!0},k=function(){return!!i(n.keyword.plusOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.plusOperator}),_(n.keyword.plusOperator),!0)},T=function(){return!!i(n.keyword.remainderOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.remainderOperator}),_(n.keyword.remainderOperator),!0)},E=function(){return!!i(n.keyword.space)&&(_(n.keyword.space),!0)},b=function(){return!!i(n.keyword.subtractionOperator)&&(s.push({column:a,index:u,row:l,value:n.keyword.subtractionOperator}),_(n.keyword.subtractionOperator),!0)},x=function(){return u<p.length},_=function(r){for(var e=0,o=r;e<o.length;e++){var t=o[e];u+=t.length,t!==n.keyword.lineFeed?a+=t.length:(a=1,l+=1)}}}},e={};function o(n){var t=e[n];if(void 0!==t)return t.exports;var i=e[n]={exports:{}};return r[n].call(i.exports,i,i.exports,o),i.exports}var n={};(()=>{var r=n;Object.defineProperty(r,"X",{value:!0}),r.L=void 0;var e=o(443),t=o(215),i=o(411);r.L=function(r){try{var o=(0,i.tokenize)(r);return{success:!0,value:(0,t.parse)(o)}}catch(r){if(r instanceof e.TranspileError)return{success:!1,value:r};throw r}}})();var t=n.X,i=n.L;export{t as __esModule,i as transpile};