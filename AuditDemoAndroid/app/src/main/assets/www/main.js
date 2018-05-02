"use strict";

var offset = (new Date(0).getTimezoneOffset()) * 60;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var settings = { srv: 'http://185.112.248.242:9002' };

$(function () {
    db.createTable('ctrl');
    db.createTable('audit_case');
    main.start();
});

var main = (function () {
    function start() {
        ui.resetLayer();

        var opts = {
            title: 'Audit Demo',
            atHome: true,
            nav: [
                { icon: 'mi_list', title: 'List from Server', func: audit_case.listFromServer },
                { icon: 'mi_settings', title: 'Settings', func: updateSetting },
            ],
            menu: [
                { icon: 'mi_storage', title: 'Database', backFunc: start, func: tools.db.start },
                { icon: 'mi_delete_forever', title: 'Reset Database', func: resetData }
            ]
        };
        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();
        ui.createAddButton(audit_case.addCase);
        $$div({ id: 'case_list_div', style: 'width: 100vw; overflow: auto;' }).appendTo($dataDiv);

        var data = db.ctrl.get('settings');
        if (data != null) {
            settings = data;
            audit_case.renderList();
        }
        else {
            updateSetting();
        }
    }

    function resetData() {
        db.audit_case.delAll();
        $.each(default_data, function (key, data) {
            data.loc_id = settings.loc_id;
            db.audit_case.add(key, data);
            audit_case.renderList();
        });
    };

    function updateSetting() {
        var opts = {
            title: 'Settings',
            fields: {
                pc_name: { typ: 'text', label: 'PC Name', required: true, val: settings.pc_name, placeholder: 'Enter Name of this Computer' },
                is_server: { typ: 'checkbox', label: 'Is Server?', val: settings.is_server },
                srv: { typ: 'text', label: 'Server', val: settings.srv, placeholder: 'Server Name' },
            }
        };

        var form = ui.form.create(opts);
        form.onSubmit = function (data) {
            settings = data;
            settings.loc_id = settings.loc_id || db.createKey();
            db.ctrl.set('settings', settings);
            ui.toast('Settings saved');
        };
    };

    return { start: start };
})();
