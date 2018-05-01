"use strict";

var color = {
    dialogHeader: '#2461a9',
    mnuFill: '?fill=' + encodeURIComponent('#808080'),
    othFill: '?fill=' + encodeURIComponent('#008080'),
    hdrFill: '?fill=' + encodeURIComponent('#FFFFFF'),
};
var animateDuration = 200;
var storageNames;

var util = (function () {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function checkError(rslt) {
        if (rslt.rc != 0) alert(rslt.msg);
    };

    function alrt(obj) {
        alert(JSON.stringify(obj, null, 2));
    };

    function binaryIndexOf(searchVal, compareFunc) {
        var minIndex = 0;
        var maxIndex = this.length - 1;
        var currIndex;
        var currElement;
        var resultIndex;

        if (!compareFunc)
            compareFunc = function (currEle, srchVal) {
                if (currEle < srchVal) {
                    return 1;
                }
                else if (currEle > srchVal) {
                    return -1;
                }
                else {
                    return 0;
                }
            };

        while (minIndex <= maxIndex) {
            resultIndex = currIndex = (minIndex + maxIndex) / 2 | 0;
            currElement = this[currIndex];
            var rslt = compareFunc(currElement, searchVal);

            if (rslt == 1) {
                minIndex = currIndex + 1;
            }
            else if (rslt == -1) {
                maxIndex = currIndex - 1;
            }
            else {
                return currIndex;
            }
        }
        return ~maxIndex;
    };

    Array.prototype.binaryIndexOf = binaryIndexOf;

    function msToDateTime(ms) {
        ms = Number(ms);
        var dt = new Date(ms);
        var dd = dt.getDate();
        var mm = months[dt.getMonth()];
        var yy = dt.getFullYear();
        var hh = dt.getHours();
        var mi = dt.getMinutes();
        var ss = dt.getSeconds();
        if (dd <= 9) dd = '0' + dd;
        if (hh <= 9) hh = '0' + hh;
        if (mi <= 9) mi = '0' + mi;
        if (ss <= 9) ss = '0' + ss;
        return dd + '-' + mm + '-' + yy + ' ' + hh + ':' + mi + ':' + ss;
    };

    function msToDate(ms) {
        var dt = new Date(ms);
        var dd = dt.getDate();
        var mm = months[dt.getMonth()];
        var yy = dt.getFullYear();
        if (dd <= 9) dd = '0' + dd;
        if (mm <= 9) mm = '0' + mm;
        return dd + '-' + mm + '-' + yy;
    };

    function msToTime(ms) {
        var dt = new Date(ms);
        var hh = dt.getHours();
        var mi = dt.getMinutes();
        var ss = dt.getSeconds();
        if (hh > 0 && mi <= 9) mi = '0' + mi;
        if (ss <= 9) ss = '0' + ss;
        return hh > 0 ? hh + ':' + mi + ':' + ss : mi + ':' + ss;
    };

    function fileSizeStr(size) {
        if (size < 1024) {
            return size + ' Bytes';
        }
        size = size / 1024;
        if (size < 1024) {
            return (Math.round(size * 100) / 100) + ' KB';
        }
        size = size / 1024;
        return (Math.round(size * 100) / 100) + ' MB';
    };

    function storageNameDisplay(name) {
        if (name.charAt(0) == 'S') name = 'SD Card/' + name.substr(1);
        else if (name.charAt(0) == 'P') name = 'Internal Storage/' + name.substr(1);
        return name;
    };

    function storagePath(name) {
        if (name.charAt(0) == 'S') name = storageNames.SDCard + name.substr(1);
        else if (name.charAt(0) == 'P') name = storageNames.PrimaryStorage + name.substr(1);
        return name;
    };

    function shortPath(name) {
        if (storageNames.SDCard && name.indexOf(storageNames.SDCard) == 0) name = name.replace(storageNames.SDCard, 'S');
        if (name.indexOf(storageNames.PrimaryStorage) == 0) name = name.replace(storageNames.PrimaryStorage, 'P');
        return name;
    };

    /*
    function storageUrl(name) {
        if (name.charAt(0) == 'S') name = storageNames.SDCardUrl + name.substr(1);
        else if (name.charAt(0) == 'P') name = storageNames.PrimaryStorageUrl + name.substr(1);
        return name;
    };
    */

    function createShortcut(shortcut, title, icon) {
        callBack.checkPermission('com.android.launcher.permission.INSTALL_SHORTCUT')
            .then(function (rslt) {
                var rslt = Native_Main.createShortCut(shortcut, title, icon);
                rslt = util.buff.parse(rslt);
                util.checkError(rslt);
            });
    };

    function now() {
        return new Date().getTime();
    };

    function callAjax(process, method, postData) {
        postData = postData || {};
        postData.process = process;
        postData.method = method;
        postData = util.buff.stringify(postData);
        var ajax = {
            url: '',
            data: postData,
        }

        return doCallAjax(ajax);
    }

    function callAjaxSrv(process, method, postData) {
        postData = postData || {};
        postData.process = process;
        postData.method = method;
        postData = util.buff.stringify(postData);
        var ajax = {
            url: settings.srv,
            data: postData,
        }

        return doCallAjax(ajax);
    }

    function doCallAjax(ajax, postData) {
        var defer = $.Deferred();
        ajax.type = 'POST';

        $('#ErrDiv').remove();
        var jqxhr = $.ajax(ajax);

        jqxhr.fail(function (jqXHR, textStatus, errorThrown) {
            ajaxProcessing = false;
            if (jqXHR.responseText) {
                var $ErrDiv = $('<div />').attr({ id: 'ErrDiv' }).appendTo($('body'));
                $ErrDiv.html(jqXHR.responseText);
            }
            else {
                var msg = 'Server Communication Error, Please make data connection.';
                alert(msg);
            }
        });

        jqxhr.done(function (rslt) {
            try {
                rslt = util.buff.parse(rslt);
            }
            catch (err) {
                alert(err);
            }
            checkError(rslt);
            if (rslt.rc == 0) {
                defer.resolve(rslt.data);
            }
        });

        return defer;
    };

    return {
        checkError: checkError,
        alert: alrt,
        msToDateTime: msToDateTime,
        msToDate: msToDate,
        msToTime: msToTime,
        fileSizeStr: fileSizeStr,
        storageNameDisplay: storageNameDisplay,
        storagePath: storagePath,
        shortPath: shortPath,
        createShortcut: createShortcut,
        now: now,
        callAjax: callAjax,
        callAjaxSrv: callAjaxSrv,
    };

})();

util.buff = (function () {
    var NUMBER = 0;
    var STRING = 1;
    var BOOLEAN = 2;
    var NULL = '~';
    var b64_str = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    var b64 = [];
    var b64_pos = {};
    var b62_str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var b62 = [];
    var b62_pos = {};

    for (var i = 0; i < b64_str.length; i++) {
        var char = b64_str.charAt(i);
        b64.push(char);
        b64_pos[char] = i;
    }

    for (var i = 0; i < b62_str.length; i++) {
        var char = b62_str.charAt(i);
        b62.push(char);
        b62_pos[char] = i;
    }

    function parse(str) {
        var buff = { str: str, pos: 0 };
        var rslt = readElement(buff);
        return rslt;
    };

    function stringify(obj) {
        var buff = { str: '' };
        writeElement(buff, obj);
        return buff.str;
    };

    function writeElement(buff, val) {
        if (val == null) {
            buff.str += NULL;
        }
        else if (typeof val === 'string') {
            buff.str += bldCtrl(STRING, val.length);
            buff.str += val;
        }
        else if (typeof val === 'number') {
            var len = val.toString().length;
            buff.str += bldCtrl(NUMBER, len);
            buff.str += val;
        }
        else if (val === true || val === false) {
            buff.str += bldCtrl(BOOLEAN, val ? 1 : 0);
        }
        else if ($.isArray(val)) {
            buff.str += '[';
            for (var i = 0; i < val.length; i++) {
                writeElement(buff, val[i]);
            }
            buff.str += ']';
        }
        else if (typeof val === 'object') {
            buff.str += '{';
            var keys = Object.keys(val);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (val[key] == null) continue;
                writeElement(buff, key);
                writeElement(buff, val[key]);
            }
            buff.str += '}';
        }
        else {
            throw 'Invalid type ' + (typeof val);
        }
    };

    function readElement(buff) {
        var c = buff.str.charAt(buff.pos);
        if (c == NULL) {
            buff.pos++;
            return null;
        }
        else if (c == '[') {
            buff.pos++;
            var arr = [];
            while (true) {
                var c = buff.str.charAt(buff.pos);
                if (c == ']') {
                    buff.pos++;
                    return arr;
                }
                arr.push(readElement(buff));
            }
        }
        else if (c == '{') {
            buff.pos++;
            var obj = {};
            while (true) {
                var c = buff.str.charAt(buff.pos);
                if (c == '}') {
                    buff.pos++;
                    return obj;
                }
                var key = readElement(buff);
                var val = readElement(buff);
                if (val == null) continue;
                obj[key] = val;
            }
        }

        var dat = readCtrl(buff);
        if (dat.typ == NUMBER) {
            var val = buff.str.substr(buff.pos, dat.len);
            buff.pos += dat.len;
            return Number(val);
        }
        else if (dat.typ == STRING) {
            var val = buff.str.substr(buff.pos, dat.len);
            buff.pos += dat.len;
            return val;
        }
        else if (dat.typ == BOOLEAN) {
            return dat.len == 1;
        }
        else {
            throw 'Invalid type ' + dat.typ;
        }
    };

    function bldCtrl(typ, len) {
        if (len == null) {
            throw 'Len is null';
        }
        if (typ > 7) {
            throw 'Type must be les than 7';
        }

        if (len < 7) {
            var i = (typ << 3) | len;
            return b64[i];
        }

        var i = (typ << 3) | 7;
        var str = b64[i];

        while (true) {
            if (len > 31) {
                var i = len & 31;
                len = len >> 5;
                str += b64[i];
            }
            else {
                len = len | 32;
                str += b64[len];
                return str;
            }
        }
    };

    function readCtrl(buff) {
        var c = buff.str.charAt(buff.pos);
        buff.pos++;
        var i = b64_pos[c];
        var typ = i >> 3;
        var len = i & 7;
        if (len < 7) {
            return { typ: typ, len: len };
        }

        var len = 0;
        var shift = 0;
        while (true) {
            var c = buff.str.charAt(buff.pos);
            buff.pos++;
            var i = b64_pos[c];
            if (i <= 31) {
                len = len | (i << shift);
                shift += 5;
            }
            else {
                len = len | ((i & 31) << shift);
                return { typ: typ, len: len };
            }
        }
    };

    function numToStr(num) {
        var str = '';
        while (true) {
            var i = num % 62;
            num = Math.floor(num / 62);
            str = b62[i] + str;
            if (num == 0) break;
        }

        return str;
    }

    function strToNum(str) {
        var num = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            var val = b62_pos[c];
            num = num * 62;
            num = num + val;
        }

        return num;
    }

    return { parse: parse, stringify: stringify, b64: b64, b64_pos: b64_pos, numToStr: numToStr, strToNum: strToNum };
})();

var onBack = (function () {
    var stack = [];

    function add(func) {
        stack.push(func);
    };

    function set(func) {
        stack = [func];
    };

    function clear() {
        stack = [];
    };

    function has() {
        if ($('.dialog_bg').length > 0) return true;
        return stack.length > 0;
    };

    function backIsHome() {
        return stack.length > 0 && stack[stack.length - 1] == main.start;
    };

    function back() {
        var $ele = $('.dialog_bg');
        if ($ele.length > 0) {
            $($ele[$ele.length - 1]).click();
            return 1;
        }
        if (stack.length > 0) {
            var func = stack.splice(stack.length - 1, 1)[0];
            func();
            return 1;
        }

        return 0;
    };

    return { add: add, set: set, clear: clear, has: has, back: back, backIsHome: backIsHome };
})();
