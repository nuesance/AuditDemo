"use strict";

var db = (function () {
    function createKey() {
        var ts = new Date().getTime();
        return util.buff.numToStr(ts);
    }

    function createTable(tname) {
        return util.callAjax('db', 'createTable', { tname: tname });
    };

    function dropTable(tname) {
        return util.callAjax('db', 'dropTable', { tname: tname });
    };

    function exists(tname, id) {
        return Native_Db.exists(tname, id);
    };

    function get(tname, id) {
        return util.callAjax('db', 'get', { tname: tname, id: id });
    };

    function getAll(tname) {
        return util.callAjax('db', 'getAll', { tname: tname });
    };

    function add(tname, id, data) {
        data = util.buff.stringify(data);
        return util.callAjax('db', 'add', { tname: tname, id: id, data: data });
    };

    function set(tname, id, data) {
        data = util.buff.stringify(data);
        return util.callAjax('db', 'set', { tname: tname, id: id, data: data });
    };

    function put(tname, id, data) {
        data = util.buff.stringify(data);
        return util.callAjax('db', 'put', { tname: tname, id: id, data: data });
    };

    function del(tname, id) {
        Native_Db.del(tname, id);
    };

    function delAll(tname) {
        return util.callAjax('db', 'delAll', { tname: tname });
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

    function execute(sql) {
        return util.callAjax('db', 'execute', { sql: sql });
    };

    function resetData() {
        delAll('ctrl');
        delAll('audit_case');
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
        createTable: createTable,
        dropTable: dropTable,
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
    };
})();

var tools_db = (function () {
    function start() {
        var $dataDiv = ui.getEmptyDataDiv();
        var opts = {
            title: 'Tables',
            menu: [
                { icon: 'mi_delete_forever', title: 'Reset Database', func: resetDatabase },
            ],
        };
        ui.header.render(opts);


        var tables = { 'ctrl': ['id', 'data'], 'audit_case': ['id', 'data'] };
        if (!tables == null) return;

        var $table = $$table({ class: 'tools_db_table' }).appendTo($dataDiv);
        var $tr = $$tr().appendTo($table);
        $$({ typ: 'th', html: 'Table' }).appendTo($tr);
        $$({ typ: 'th', html: 'Columns' }).appendTo($tr);

        $.each(tables, function (tableName, cols) {
            var $tr = $$tr().appendTo($table);
            var $td = $$td({ html: tableName }).appendTo($tr);
            var $td = $$td({ html: cols.join(', ') }).appendTo($tr);
            $tr.click(function () { tableData(tableName, cols); });
        });

        function resetDatabase() {
            var opts = { title: 'Reset Database', message: 'Delete all rows from all tables', onConfirm: db.resetData };
            ui.confirm(opts);
        };
    };

    function tableData(tableName, cols) {
        var $dataDiv = ui.getEmptyDataDiv();
        onBack.add(start);
        var opts = {
            title: tableName,
            menu: [
                { icon: 'mi_launch', title: 'View Row', func: viewRow },
                { icon: 'mi_library_add', title: 'Add New Row', func: addNewRow },
                { icon: 'mi_edit', title: 'Edit Row', func: editRow },
                { icon: 'mi_delete', title: 'Delete Row', func: deleteRow },
                { icon: 'mi_delete_sweep', title: 'Delete All', func: deleteAll },
                { icon: 'mi_delete_forever', title: 'Drop Table', func: dropTable },
            ],
        };
        ui.header.render(opts);

        var $table = $$table({ class: 'tools_db_table' }).appendTo($dataDiv);
        var $tr = $$tr().appendTo($table);
        for (var i = 0; i < cols.length; i++) {
            $$({ typ: 'th', html: cols[i] }).appendTo($tr);
        }

        var rslt = db.getAll(tableName).then(function (map) {
            $.each(map, function (id, data) {
                var $tr = $$tr().appendTo($table);
                var $td = $$td({ html: id }).appendTo($tr);
                var txt = JSON.stringify(data);
                if (txt.length > 30) txt = txt.substr(0, 30) + ' ...';
                var $td = $$td({ html: txt }).appendTo($tr);
                $tr.click(function () {
                    $table.children().removeClass('tools_db_tr_sel');
                    $tr.addClass('tools_db_tr_sel');
                    $tr.data({ cols: cols, row: [id, data] });
                });
            });
        });

        function viewRow() {
            var $tr = $('.tools_db_tr_sel');
            if ($tr.length == 0) {
                ui.toast('No row selected');
                return;
            }
            var data = $tr.data();

            var dialog = ui.buildDialog(true, false);

            dialog.header.html('View Row');
            var bigCols = 0;
            for (var i = 0; i < data.cols.length; i++) {
                var col = data.cols[i];
                if (col == 'data' || col == 'rslt') {
                    bigCols++;
                }
            }
            for (var i = 0; i < data.cols.length; i++) {
                var col = data.cols[i];
                var val = data.row[i];
                if (col == 'data' || col == 'rslt') {
                    $$div({ html: '<b>' + col + '</b>' }).appendTo(dialog.body);
                    if (val) {
                        val = JSON.stringify(val, null, 2);
                    }
                    $$({ typ: 'textArea', rows: 24 / bigCols, val: val }).appendTo(dialog.body);
                } else {
                    $$div({ html: col + ': ' + val }).appendTo(dialog.body);
                }
            }
        };

        function addNewRow() {
            alert('Not implemented yet');
        };

        function editRow() {
            var $tr = $('.tools_db_tr_sel');
            if ($tr.length == 0) {
                ui.toast('No row selected');
                return;
            }
            var data = $tr.data();

            var formOpts = {
                title: 'Edit Row',
                fields: {},
            }

            for (var i = 0; i < data.cols.length; i++) {
                var col = data.cols[i];
                var val = data.row[i];
                if (col == 'data') {
                    val = JSON.stringify(val, null, 2);
                    formOpts.fields[col] = { typ: 'textarea', rows: 20, label: col, val: val };
                } else {
                    formOpts.fields[col] = { typ: 'text', label: col, val: val };
                }
            }

            var form = ui.form.create(formOpts);
            form.onSubmit = function (valuMap) {
                var data = valuMap.data;
                data = JSON.parse(data);
                valuMap.data = util.buff.stringify(data);
                var params = [];
                var sql = 'Update ' + tableName + ' Set ';
                for (var i = 1; i < cols.length; i++) {
                    var col = cols[i];
                    sql += col + ' = ?';
                    if (i < cols.length - 1) sql += ', ';
                    params.push(valuMap[col]);
                }
                sql += ' Where id = ?';
                params.push(valuMap['id']);
                var args = [sql].concat(params);
                db.execute.apply(null, args);
                tableData(tableName, cols);
            };
        };

        function deleteRow() {
            var $tr = $('.tools_db_tr_sel');
            if ($tr.length == 0) {
                ui.toast('No row selected');
                return;
            }
            var data = $tr.data();
            db.execute('Delete From ' + tableName + " Where id = '" + data.row[0] + "'");
            $tr.remove();
        }

        function deleteAll() {
            var opts = { title: 'Delete All', message: 'Delete all rows from ' + tableName };
            opts.onConfirm = function () {
                db.execute('Delete From ' + tableName);
                tableData(tableName, cols);
            };
            ui.confirm(opts);
        };

        function dropTable() {
            var opts = { title: 'Drop Table', message: 'Drop Table' + tableName };
            opts.onConfirm = function () {
                db.execute('Drop table ' + tableName);
                start();
            };
            ui.confirm(opts);
        }
    };

    return {
        start: start,
    };
})();

