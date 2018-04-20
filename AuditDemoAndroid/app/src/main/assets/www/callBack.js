"use strict";

var callBack = (function () {
    var id = 0;
    var stack = {};

    function build() {
        var defer = $.Deferred();
        id++;
        stack[id] = defer;
        return { id: id, defer: defer, then: defer.then };
    };

    function resolve(id, rslt) {
        var rslt = util.buff.parse(rslt);
        stack[id].resolve(rslt);
        delete stack[id];
    };

    function call(func) {
        var defer = $.Deferred();
        id++;
        stack[id] = defer;
        func(id);
        return defer;
    };

    function checkPermission(permission) {
        return call(function (callId) {
            Native_Main.checkPermission(callId, permission);
        });
    }

    function selectFolder() {
        return call(function (callId) {
            Native_Main.selectFolder(callId);
        });
    }

    return {
        build: build,
        call: call,
        resolve: resolve,
        checkPermission: checkPermission,
        selectFolder: selectFolder,
    };
})();
