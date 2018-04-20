"use strict";

var db = (function () {
    function createKey() {
        var ts = new Date().getTime();
        return util.buff.numToStr(ts);
    }

    function createTable(tname) {
        return Native_Db.createTable(tname);
    };

    function dropTable(tname) {
        return Native_Db.dropTable(tname);
    };

    function exists(tname, id) {
        return Native_Db.exists(tname, id);
    };

    function get(tname, id) {
        var str = Native_Db.get(tname, id);
        return str ? util.buff.parse(str) : null;
    };

    function getAll(tname) {
        var str = Native_Db.getAll(tname);
        return util.buff.parse(str);
    };

    function add(tname, id, data) {
        data = util.buff.stringify(data);
        Native_Db.add(tname, id, data);
    };

    function set(tname, id, data) {
        data = util.buff.stringify(data);
        Native_Db.set(tname, id, data);
    };

    function put(tname, id, data) {
        data = util.buff.stringify(data);
        Native_Db.put(tname, id, data);
    };

    function del(tname, id) {
        Native_Db.del(tname, id);
    };

    function delAll(tname) {
        Native_Db.delAll(tname);
    };

    function retrieve() {
        var param = Array.prototype.slice.call(arguments);
        var sql = param.shift();
        param = param.length > 0 ? util.buff.stringify(param) : '';
        var str = Native_Db.retrieve(sql, param);
        var rslt = util.buff.parse(str);
        util.checkError(rslt);
        return rslt;
    };

    function execute() {
        var param = Array.prototype.slice.call(arguments);
        var sql = param.shift();
        param = param.length > 0 ? util.buff.stringify(param) : '';
        var str = Native_Db.execute(sql, param);
        var rslt = util.buff.parse(str);
        util.checkError(rslt);
        return rslt;
    };

    function resetData() {
        delAll('ctrl');
        delAll('audit_case');
    };

    function getMetadata() {
        var tbls = {};
        var rslt = retrieve("Select name From sqlite_master Where type='table' And name Not In ('android_metadata') Order By name");
        if (rslt.rc != 0) return;
        var rows = rslt.data;
        for (var i = 0; i < rows.length; i++) {
            var tableName = rows[i][0];
            var cols = [];
            tbls[tableName] = cols;
            var sql = "pragma table_info('" + tableName + "')";
            var rslt = retrieve(sql);
            if (rslt.rc != 0) return;
            var colRows = rslt.data;
            for (var j = 0; j < colRows.length; j++) {
                var colName = colRows[j][1];
                //cols[colName] = colRows[j][2];
                cols.push(colName);
            }
        }
        return tbls;
    };

    function table(tableName, extrCols) {
        var tname = tableName;
        var extraCols = extrCols;

        return {
            get: function (id) {
                return get(tname, id);
            },

            getAll: function () {
                return getAll(tname);
            },

            add: function (id, data) {
                return add(tname, id, data);
            },

            set: function (id, data) {
                return set(tname, id, data);
            },

            put: function (id, data) {
                return put(tname, id, data);
            },

            del: function (id) {
                return del(tname, id);
            },

            delAll: function () {
                return delAll(tname);
            },
        };
    };

    function ctrl() {
        var tbl = table('ctrl');
        tbl.set = tbl.put;
        return tbl;
    };

    function tableList() {
        var str = Native_Db.tableList();
        return util.buff.parse(str);
    };

    return {
        tableList: tableList,
        table: table,
        retrieve: retrieve,
        execute: execute,
        createKey: createKey,
        exists: exists,
        get: get,
        getAll: getAll,
        add: add,
        set: set,
        put: put,
        del: del,
        delAll: delAll,
        resetData: resetData,
        ctrl: ctrl(),
        audit_case: table('audit_case'),
        getMetadata: getMetadata,
    };
})();
