"use strict";

var offset = (new Date(0).getTimezoneOffset()) * 60;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

$(function () {
    main.start();
});

var main = (function () {
    function start() {
        ui.resetLayer();

        var opts = {
            title: 'Audit Demo',
            atHome: true,
            nav: [
                { icon: 'mi_storage', title: 'Database', backFunc: start, func: tools_db.start },
                { icon: 'mi_refresh', title: 'Reset Database', func: resetData },
            ],
            menu: [
                { icon: 'mi_settings', title: 'Settings', func: function () { ui.toast('Settings') } },
            ]
        };
        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();
        ui.createAddButton(audit_case.addCase);
        $$div({ id: 'case_list_div', style: 'width: 100vw; overflow: auto;' }).appendTo($dataDiv);
        audit_case.renderList();
    }

    function resetData() {
        db.audit_case.delAll();
        $.each(default_data, function (key, data) {
            db.audit_case.add(key, data).then(renderList);
        });
    };

    return { start: start };
})();
