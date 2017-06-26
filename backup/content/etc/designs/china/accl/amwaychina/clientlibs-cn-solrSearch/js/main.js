/* jshint ignore:start */
Array.prototype.unique = function() {
    var o = {},
        i, l = this.length,
        r = [];
    for (i = 0; i < l; i += 1) o[this[i]] = this[i];
    for (i in o) r.push(o[i]);
    return r;
};

Array.prototype.uniqueTrim = function() {
    var o = {},
        i, l = this.length,
        r = [];
    for (i = 0; i < l; i++) typeof(this[i]) !== "undefined" && this[i].trim() !== "" ? o[this[i].trim()] = this[i].trim() : null;
    for (i in o) r.push(o[i]);
    return r;
};

String.prototype.toHHMMSS = function() {
    var second = parseInt(this, 10); // don't forget the second param
    var minute = Math.floor(second / 60);
    var hours = Math.floor(minute / 60);
    var minutes = minute % 60;
    var seconds = second % 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }

    var time = hours + ':' + minutes + ':' + seconds;
    return time;
};

// 转全角字符
String.prototype.toDBC = function() {
    var result = '';
    var len = this.length;
    for (var i = 0; i < len; i++) {
        var cCode = this.charCodeAt(i);
        // 全角与半角相差（除空格外）：65248(十进制)
        cCode = (cCode >= 0x0021 && cCode <= 0x007E) ? (cCode + 65248) : cCode;
        // 处理空格
        cCode = (cCode === 0x0020) ? 0x03000 : cCode;
        result += String.fromCharCode(cCode);
    }
    return result;
};

// 转半角字符
String.prototype.toSBC = function() {
    var result = '';
    var len = this.length;
    for (var i = 0; i < len; i++) {
        var cCode = this.charCodeAt(i);
        // 全角与半角相差（除空格外）：65248（十进制）
        cCode = (cCode >= 0xFF01 && cCode <= 0xFF5E) ? (cCode - 65248) : cCode;
        // 处理空格
        cCode = (cCode === 0x03000) ? 0x0020 : cCode;
        result += String.fromCharCode(cCode);
    }
    return result;
};

// Escapes the RegExp special characters in string.
RegExp.escapeRegExp = function(str) {
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g
    var reHasRegExpChar = RegExp(reRegExpChar.source);
    return (str && reHasRegExpChar.test(str)) ? str.replace(reRegExpChar, '\\$&') : str;
};
/* jshint ignore:end */
