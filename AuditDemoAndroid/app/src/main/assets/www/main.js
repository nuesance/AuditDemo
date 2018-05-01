"use strict";

$(function () {
    var url = window.location.href;
    var shortcutPos = url.indexOf('shortcut=');
    if (shortcutPos != -1) {
        ui.resetLayer();
        var shortcut = url.substr(shortcutPos + 9);
        if (shortcut == 'apps') {
            apps.start();
        }
        else if (shortcut == 'tools') {
            tools.start();
        }
        else if (shortcut == 'contacts_grid') {
            contact.start();
        }
        else if (shortcut == 'gallery_content') {
            gallery.content.start();
        }
        else if (shortcut == 'gallery_explorer') {
            gallery.explorer.start();
        }
        else if (shortcut == 'photo_compress') {
            photoCompress.start();
        }
        else if (shortcut == 'nomedia') {
            nomedia.start();
        }
        else if (shortcut == 'google_explorer') {
            tools.gd_explorer.start();
        }
        else if (shortcut == 'photo_compress') {
            photoCompress.start();
        }
        else if (shortcut == 'drive_sync') {
            driveSync.start();
        }
    }
    else {
        ui.toast('Welcome to Audit Demo');
        main.start();
    }
});

var main = (function () {
    function start() {
        ui.resetLayer();

        var opts = {
            title: 'Audit Demo',
            atHome: true,
            nav: [
                { icon: 'mi_build', title: 'Tools', backFunc: start, func: function () { tools.start(); } },
            ],
            menu: [
                { icon: 'mi_settings', title: 'Settings', func: function () { ui.toast('Settings') } },
            ]
        };

        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();
        ui.createAddButton(addCase);
        var $listDiv = $$div({ style: 'width: 100vw; overflow: auto;' }).appendTo($dataDiv);
        renderList();

        function addCase() {
            var opts = {
                title: 'Create Case',
                fields: {
                    case_name: { typ: 'text', label: 'Case Name', required: true, placeholder: 'Enter Case Name' },
                    desc: { typ: 'textarea', label: 'Description', required: true, rows: 5 },
                }
            };

            var form = ui.form.create(opts);
            form.onSubmit = function (valuMap) {
                var key = db.createKey();
                db.audit_case.add(key, valuMap);
                renderList();
            };
        }

        function renderList() {
            $listDiv.empty();
            var map = db.audit_case.getAll();
            $.each(map, function (id, data) {
                $$div({ html: data.case_name, class: 'card_1' }).appendTo($listDiv);
            });
        }
    };

    return {
        start: start,
    };
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

