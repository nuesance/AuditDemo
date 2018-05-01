"use strict";

var tools = (function () {
    function start() {
        var opts = {
            title: 'Tools',
            menu: [
                { icon: 'mi_launch', title: 'Create Shortcut', func: function () { util.createShortcut('tools', 'Tools', 'mi_build'); } },
                {
                    title: 'ActivityResult Test', func: function () {
                        callBack.call(function (callId) {
                            var intent = { intent: 'android.intent.action.OPEN_DOCUMENT', category: 'android.intent.category.OPENABLE', type: 'image/*' };
                            Native_Main.testActivityResult(callId, util.buff.stringify(intent));
                        }).then(function (rslt) {
                            util.alert(rslt);
                        });
                    }
                },
                {
                    title: 'Refresh My Google Drive', func: function () {
                        var rslt = Native_Main.messageToService(REFRESH_MY_GD);
                        var rslt = util.buff.parse(rslt);
                        util.checkError(rslt);
                    }
                },
                { title: 'Promise Test', func: tools.promiseTest.start },
            ],
        };
        ui.header.render(opts);

        var items = [
            { icon: 'svg/mi_storage', title: 'Database', backFunc: start, func: tools.db.start },
            { icon: 'svg/mi_format_list_bulleted', title: 'Logcat', backFunc: start, func: tools.logcat.start },
        ];
        apps.renderIcons(items);
    };

    return {
        start: start,
    };
})();

tools.db = (function () {
    function start() {
        var $dataDiv = ui.getEmptyDataDiv();
        var opts = {
            title: 'Tables',
            menu: [
                { icon: 'mi_delete_forever', title: 'Reset Database', func: resetDatabase },
            ],
        };
        ui.header.render(opts);


        var tables = db.getMetadata();
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

        var rslt = db.retrieve('Select ' + cols.join(', ') + ' From ' + tableName + ' Order By id');
        if (rslt.rc != 0) return;
        var rows = rslt.data;
        $.each(rows, function (i, row) {
            var $tr = $$tr().appendTo($table);
            for (var i = 0; i < cols.length; i++) {
                var data = row[i];
                if (!data) continue;
                var col = cols[i];
                if (col != 'data' && col != 'rslt') {
                    var $td = $$td({ html: data }).appendTo($tr);
                }
                else {
                    data = util.buff.parse(data);
                    var txt = JSON.stringify(data);
                    if (txt.length > 30) txt = txt.substr(0, 30) + ' ...';
                    var $td = $$td({ html: txt }).appendTo($tr);
                    $tr.click(function () {
                        $table.children().removeClass('tools_db_tr_sel');
                        $tr.addClass('tools_db_tr_sel');
                        $tr.data({ cols: cols, row: row });
                    });
                }
            }
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
                        val = util.buff.parse(val);
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
                    val = util.buff.parse(val);
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
            db.execute('Delete From ' + tableName + ' Where id = ?', data.row[0]);
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

tools.logcat = (function () {
    function start() {
        var $dataDiv = ui.getEmptyDataDiv();
        var opts = {
            title: 'Logcat',
            menu: [
                { icon: 'mi_delete_forever', title: 'Clear Log', func: clearLog },
            ],
        };
        ui.header.render(opts);

        var rslt = Native_Main.getLogcat();
        var rslt = util.buff.parse(rslt);
        util.checkError(rslt);
        if (rslt.rc != 0) return;
        var rows = rslt.data;

        var $table = $$table({ class: 'tools_db_table' }).appendTo($dataDiv);
        var $tr = $$tr().appendTo($table);
        $$({ typ: 'th', html: 'Log' }).appendTo($tr);
        $.each(rows, function (i, row) {
            var txt = row;
            if (txt.length > 50) txt = txt.substr(0, 50) + '...';
            var $tr = $$tr().appendTo($table);
            var $td = $$td().appendTo($tr);
            var $div = $$div({ html: txt, style: 'max-width: 96vw; word-wrap: break-word;' }).appendTo($td);
            $tr.click(function () { $div.html(row); });
        });

        function clearLog() {
            var rslt = Native_Main.clearLogcat();
            var rslt = util.buff.parse(rslt);
            util.checkError(rslt);
            if (rslt.rc != 0) return;
            start();
        };
    };

    return {
        start: start,
    };
})();

tools.promiseTest = (function () {
    function start() {
        var $dataDiv = ui.getEmptyDataDiv();
        var opts = {
            title: 'Promise Test',
        };
        ui.header.render(opts);

        var $table = $$table({ class: 'tools_db_table' }).appendTo($dataDiv);
        var $tr = $$tr().appendTo($table);
        $$({ typ: 'th', html: 'Result' }).appendTo($tr);

        var q = new fnQ();

        for (var i = 1; i < 5; i++) {
            q.push(function (fnEle) {
                setTimeout(function () {
                    fnEle.data.val = fnEle.data.val || 0;
                    fnEle.data.val += 100;
                    fnEle.resolve();
                }, 100);
            });

            q.push(function (fnEle) {
                var $tr = $$tr().appendTo($table);
                var $td = $$td({ html: fnEle.data.val }).appendTo($tr);
                fnEle.resolve();
            });
        }

        q.then(function () {
            var $tr = $$tr().appendTo($table);
            var $td = $$td({ html: 'Done' }).appendTo($tr);
        });

        q.exec();

        var $tr = $$tr().appendTo($table);
        var $td = $$td({ html: 10 }).appendTo($tr);

    };

    return {
        start: start,
    };
})();

function fnQ() {
    var self = this;
    self.q = [];
    self.data = {};
    self.currPos = -1;
    self._then = null;
}

fnQ.prototype.next = function () {
    var self = this;

    self.currPos++;
    if (self.currPos < self.q.length) {
        var fn_ele = self.q[self.currPos];
        fn_ele.fnQ = self;
        fn_ele.data = self.data;
        fn_ele.exec();
        fn_ele.then(function () {
            self.next();
        });
    }
    else if (self._then != null) {
        self._then();
    }
}

fnQ.prototype.push = function (fn) {
    this.q.push(new fnEle(fn));
}

fnQ.prototype.exec = function () {
    this.next();
}

fnQ.prototype.then = function (fn) {
    this._then = fn;
}

function fnEle(fn) {
    var self = this;
    self._resolve = null;
    self._reject = null;
    self.fn = fn;

    self.promise = new Promise(function (res, rej) {
        self._resolve = res;
        self._reject = rej;
    });
}

fnEle.prototype.resolve = function (param) {
    this._resolve(param);
}

fnEle.prototype.then = function (param) {
    this.promise.then(param);
}

fnEle.prototype.exec = function () {
    this.fn(this);
}
