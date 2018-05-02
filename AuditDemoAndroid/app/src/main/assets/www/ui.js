"use strict";

var ui = (function () {
    var $cssVarEle;
    var cssVarObj = {};

    function cssVar(name, val) {
        if (!$cssVarEle) {
            $cssVarEle = $$({ typ: 'style' }).appendTo($('head'));
        }

        if (val) {
            cssVarObj[name] = val;
        }
        else {
            delete cssVarObj[name];
        }
        var txt = ':root {';
        for (var key in cssVarObj) {
            txt += '--' + key + ':' + cssVarObj[key] + ';';
        }
        txt += '}';
        $cssVarEle.html(txt);
    }

    function resetLayer(opts) {
        $('body').empty();
        addLayer(opts);
    };

    function addLayer(opts) {
        opts = opts || {};
        var $body = $('body');
        var $table = $$table({ class: 'layer_table' }).appendTo($body);
        if (opts.noHeader !== true) {
            var $tr = $$tr().appendTo($table);
            var $td = $$td({ class: 'no_border' }).appendTo($tr);
            var $div = $$div({ class: 'header_div' }).appendTo($td);
        }
        var $tr = $$tr().appendTo($table);
        var $td = $$td({ class: 'no_border', style: 'height: 99.99%; vertical-align: top; background-color: white;' }).appendTo($tr);
        var $div = $$div({ class: 'data_div' }).appendTo($td);
        if (opts.footer === true) {
            var $tr = $$tr().appendTo($table);
            var $td = $$td({ class: 'no_border' }).appendTo($tr);
            var $div = $$div({ class: 'footer_div' }).appendTo($td);
        }
    };

    function getTopLayer() {
        var $layers = $('.layer_table');
        return $($layers[$layers.length - 1]);
    };

    function removeLayer() {
        var $layer = getTopLayer();
        $layer.remove();
    };

    function getHeaderDiv() {
        var $layer = getTopLayer();
        var $find = $layer.find('.header_div');
        if ($find.length > 0) return $($find[0]);
        var $tr = $$tr().prependTo($layer);
        var $td = $$td({ class: 'no_border' }).appendTo($tr);
        var $div = $$div({ class: 'header_div' }).appendTo($td);
        return $div;
    };

    function getEmptyHeaderDiv() {
        return getHeaderDiv().empty();
    };

    function removeHeader() {
        var $headerDiv = getHeaderDiv();
        $headerDiv.closest('tr').remove();
    }

    function getDataDiv() {
        var $layer = getTopLayer();
        var $find = $layer.find('.data_div');
        if ($find.length > 0) return $($find[0]);
        alert('Error: DataDiv not found');
    };

    function getEmptyDataDiv() {
        var $dataDiv = getDataDiv();
        var $div = $$div({ class: 'data_div' });
        $dataDiv.replaceWith($div);
        return $div;
    };

    function getFooterDiv() {
        var $layer = getTopLayer();
        var $find = $layer.find('.footer_div');
        if ($find.length > 0) return $($find[0]);
        alert('Error: FooterDiv not found');
    };

    function getEmptyFooterDiv() {
        var $footerDiv = getFooterDiv();
        var $div = $$div({ class: 'footer_div' });
        $footerDiv.replaceWith($div);
        return $div;
    };

    function showError(err) {
        Native_Main.showError(err);
    };

    function toast(txt) {
        Native_Main.toast(txt);
    };

    function confirm(opts) {
        var dialog = buildDialog(true, true);
        opts.title = opts.title || 'Warning';
        dialog.header.css({ color: color.dialogHeader }).html(opts.title);
        if (opts.body) {
            opts.body.appendTo(dialog.body);
        }
        else if (opts.message) {
            $$div({ html: opts.message, style: 'text-align: center; font-size: 1.2em; margin-bottom: 20px;' }).appendTo(dialog.body);
        }

        var cancel = opts.cancel || 'Cancel';
        dialog.footer.css({ 'text-align': 'right' });
        $$a({ html: cancel, click: dialog.remove, style: 'padding: 20px; font-size: 1.2em;' }).appendTo(dialog.footer);
        if (opts.actions) {
            $.each(opts.actions, function (i, action) {
                $$div({ style: 'padding: 5px;' }).appendTo($buttonDiv);
                $$a({
                    html: action.label, style: 'padding: 20px; font-size: 1.2em;', click: function () {
                        dialog.remove();
                        action.func();
                    }
                }).appendTo(dialog.footer);
            });
        }
        else {
            var confirm = opts.confirm || 'Continue';
            $$a({
                html: confirm, style: 'padding: 20px; font-size: 1.2em;', click: function () {
                    dialog.remove();
                    opts.onConfirm();
                }
            }).appendTo(dialog.footer);
        }
    };

    function buildDialog(header, footer) {
        var $dataDiv = getDataDiv();

        var $bg = ui.dialogBackGround({ animation: 'dialogSlideOut' });
        var $dialog = $$div({ class: 'dialog' }).appendTo($bg);
        $dialog.click(function (ev) {
            ev.stopPropagation()
        });

        if (header) {
            var $header = $$div({ style: 'text-align: center; font-size: 1.5em; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0;' }).appendTo($dialog);
        }
        var $body = $$div({ class: 'dialog_body' }).appendTo($dialog);
        if (footer) {
            var $footer = $$div({ style: 'margin-bottom: 20px; border-top: 1px solid #f0f0f0;' }).appendTo($dialog);
        }

        function remove() {
            $bg.click();
        }
        return { dialog: $dialog, body: $body, header: $header, footer: $footer, remove: remove };

    };

    function dialogBackGround(opts) {
        opts = opts || {};
        var $dataDiv = getDataDiv();
        var $bg = $$div({
            class: 'dialog_bg', click: function () {
                if (opts.animation) {
                    $bg.children().css({ animation: opts.animation + ' 600ms' });
                    $bg.css({ animation: 'fadeOut 600ms' });
                }
                setTimeout(function () { $bg.remove(); }, 600);
            },
        }).appendTo($dataDiv);
        return $bg;
    };

    function setSwipe($ele, opts) {
        var swipedir;
        var startX;
        var startY;
        var distX;
        var distY;
        var threshold = 150; // Required min distance for swipe
        var restraint = 100; // Maximum distance allowed at the same time in perpendicular direction
        var allowedTime = 300; // Maximum time allowed to travel that distance
        var elapsedTime;
        var startTime;

        var touchsurface = $ele[0];

        touchsurface.addEventListener('touchstart', function (e) {
            var touchobj = e.changedTouches[0];
            swipedir = 'none';
            startX = touchobj.pageX;
            startY = touchobj.pageY;
            startTime = new Date().getTime();
            e.preventDefault();
        }, false)

        touchsurface.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false)

        touchsurface.addEventListener('touchend', function (e) {
            var touchobj = e.changedTouches[0];
            distX = touchobj.pageX - startX;
            distY = touchobj.pageY - startY;
            elapsedTime = new Date().getTime() - startTime;
            if (elapsedTime <= allowedTime) {
                if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                    if (distX < 0) {
                        if (opts.left) opts.left();
                    } else {
                        if (opts.right) opts.right();
                    }
                }
                else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
                    if (distY < 0) {
                        if (opts.up) opts.up();
                    } else {
                        if (opts.down) opts.down();
                    }

                }
            }
            e.preventDefault();
        }, false);
    };

    function createAddButton(func) {
        var $dataDiv = getDataDiv();
        $$img({ src: 'svg/mi_add_circle' + color.othFill, click: func, style: 'position: absolute; bottom: 30px; right: 30px; width: 3rem; height: 3rem;' }).appendTo($dataDiv);
    };

    function showLoading() {
        var $dataDiv = ui.getEmptyDataDiv();
        $$img({ src: 'img/loading.svg', class: 'loading_img' }).appendTo($dataDiv);
    };

    function elem(opt) {
        return new Ele(opt);
    };

    function toHtml(el) {
        var txt = '<' + el.typ;

        for (var key in el) {
            var valu = el[key];
            if (key == 'typ' || key == 'nodes' || key == 'children' || key == 'child' || key == 'html') { }
            else if (key == 'css') {
                var style = '';
                for (var key2 in valu) {
                    var vlu = valu[key2];
                    style += key2 + ':' + vlu + ';';
                }
                txt += ' style="' + style + '"';
            }
            else txt += ' ' + key + '="' + valu + '"';
        }
        txt += '>';
        if (el.html) txt += el.html;

        if (el.children) {
            for (var i = 0; i < el.children.length; i++) {
                txt += toHtml(el.children[i]);
            }
        }

        if (el.child) {
            txt += toHtml(el.child);
        }

        return txt + '</' + el.typ + '>';
    };

    return {
        resetLayer: resetLayer,
        addLayer: addLayer,
        removeLayer: removeLayer,
        getHeaderDiv: getHeaderDiv,
        getEmptyHeaderDiv: getEmptyHeaderDiv,
        removeHeader: removeHeader,
        getDataDiv: getDataDiv,
        getEmptyDataDiv: getEmptyDataDiv,
        getFooterDiv: getFooterDiv,
        getEmptyFooterDiv: getEmptyFooterDiv,
        showError: showError,
        toast: toast,
        confirm: confirm,
        buildDialog: buildDialog,
        dialogBackGround: dialogBackGround,
        cssVar: cssVar,
        setSwipe: setSwipe,
        createAddButton: createAddButton,
        showLoading: showLoading,
        toHtml: toHtml,
        elem: elem,
    };

})();

ui.form = (function () {
    var formOpts;
    var fldMap;
    var form;

    function create(opts) {
        formOpts = opts;
        fldMap = {};

        var $form = $$div();
        form = { $form: $form };
        for (var key in formOpts.fields) {
            var fld = formOpts.fields[key];
            fld.name = key;
            var $fld;
            if (fld.typ == 'text') {
                $fld = appendInput($form, fld);
            }
            else if (fld.typ == 'textarea') {
                $fld = appendTextarea($form, fld);
            }
            else if (fld.typ == 'checkbox') {
                $fld = appendCheckbox($form, fld);
            }
            else if (fld.typ == 'radio') {
                $fld = appendRadiobutton($form, fld);
            }
            else if (fld.typ == 'select') {
                $fld = appendSelect($form, fld);
            }
            else if (fld.typ == 'folder') {
                $fld = appendFolder($form, fld);
            }
            else if (fld.typ == 'gd_folder') {
                $fld = appendGDFolder($form, fld);
            }
            else {
                alert('Invalid field type ' + fld.typ + ' for ' + key);
            }
            fldMap[key] = $fld;
        }

        if (formOpts.dialog !== false) createDialog();

        return form;
    };

    function validate() {
        form.isValid = true;

        var valuMap = values();
        for (var key in formOpts.fields) {
            var fld = formOpts.fields[key];
            if (fld.required && !valuMap[key]) {
                ui.toast(fld.label + ' is required');
                form.isValid = false;
                break;
            }
        }

        if (form.onValidate) form.isValid = form.onValidate(valuMap)
    };

    function submit() {
        validate();
        if (form.isValid) {
            var valuMap = values();
            form.onSubmit(valuMap);
        }
    };

    function values() {
        var valuMap = {};
        for (var key in formOpts.fields) {
            var fld = formOpts.fields[key];
            var $fld = fldMap[key];
            if (fld.typ == 'checkbox') {
                valuMap[key] = $fld.prop('checked');
            }
            else if (fld.typ == 'radio') {
                for (var j = 0; j < $fld.length; j++) {
                    var $fl = $fld[j];
                    if ($fl.prop('checked')) {
                        valuMap[key] = $fl.val();
                        break;
                    }
                }
            }
            else if (fld.typ == 'folder' || fld.typ == 'gd_folder') {
                valuMap[key] = fld.folder;
            }
            else {
                valuMap[key] = $fld.val();
            }
        }
        return valuMap;
    };

    function createDialog() {
        var dialog = ui.buildDialog(true, true);
        dialog.header.css({ color: color.dialogHeader }).html(formOpts.title);
        form.$form.appendTo(dialog.body);
        dialog.footer.css({ 'margin-top': '10px', 'padding': '10px', 'text-align': 'right' });
        $$a({ html: 'Cancel', click: dialog.remove, style: 'padding: 20px; font-size: 1.2em;' }).appendTo(dialog.footer);

        $$a({
            html: 'Ok', style: 'padding: 20px; font-size: 1.2em;', click: function () {
                submit();
                if (form.isValid) dialog.remove();
            }
        }).appendTo(dialog.footer);
    };

    function appendLabel($parent, fld) {
        var $label = $$label({ html: fld.label, for: 'fld_' + fld.name, style: 'display: block;' }).appendTo($parent);
        return $label;
    };

    function appendInput($parent, fld) {
        appendLabel($parent, fld);
        var $fld = $$input({ type: 'text', name: fld.name, id: 'fld_' + fld.name }).appendTo($parent);
        if (fld.val) $fld.val(fld.val);
        if (fld.placeholder) $fld.attr({ placeholder: fld.placeholder });
        return $fld;
    };

    function appendTextarea($parent, fld) {
        appendLabel($parent, fld);
        var $fld = $$({ typ: 'textarea', name: fld.name, id: 'fld_' + fld.name }).appendTo($parent);
        if (fld.val) $fld.val(fld.val);
        if (fld.placeholder) $fld.attr({ placeholder: fld.placeholder });
        $fld.attr({ rows: fld.rows || 10 });
        return $fld;
    };

    function appendCheckbox($parent, fld) {
        $('<br />').appendTo($parent);
        var $fld = $$input({ type: 'checkbox', name: fld.name, id: 'fld_' + fld.name }).appendTo($parent);
        if (fld.val) $fld.prop({ checked: true });
        var $label = $$label({ html: fld.label, for: 'fld_' + fld.name }).appendTo($parent);
        return $fld;
    };

    function appendRadiobutton($parent, fld) {
        appendLabel($parent, fld);
        var $fld = [];
        var keys = Object.keys(fld.options);
        for (var i = 0; i < keys.length; i++) {
            var val = keys[i];
            var display = fld.options[val];
            var $radio = $$input({ type: 'radio', name: fld.name, id: 'fld_' + fld.name + i }).val(val).appendTo($parent);
            if (fld.val == val) $radio.prop({ checked: true });
            var $label = $$label({ html: display, for: 'fld_' + fld.name + i }).appendTo($parent);
            $fld.push($radio);
        }
        return $fld;
    };

    function appendSelect($parent, fld) {
        appendLabel($parent, fld);
        var $fld = $$({ typ: 'select', name: fld.name, id: 'fld_' + fld.name }).appendTo($parent);
        var keys = Object.keys(fld.options);
        for (var i = 0; i < keys.length; i++) {
            var val = keys[i];
            var display = fld.options[val];
            var $option = $$({ typ: 'option', value: val }).html(display).appendTo($fld);
            if (fld.val == val) $option.prop({ selected: true });
        }
        return $fld;
    };

    function appendFolder($parent, fld) {
        appendLabel($parent, fld);
        fld.folder = fld.val;
        var $fld = $$div({
            html: fld.val ? util.storageNameDisplay(fld.val) : fld.label, click: onClick, class: 'btn', style: 'margin-top: 10px; width: 98%;'
        }).appendTo($parent);

        function onClick() {
            callBack.selectFolder()
                .then(function (rslt) {
                    util.checkError(rslt);
                    if (rslt.rc != 0) return;
                    if (rslt.data) {
                        $fld.html(util.storageNameDisplay(rslt.data));
                        fld.folder = rslt.data;
                    }
                });
        };
        return $fld;
    };

    function appendGDFolder($parent, fld) {
        appendLabel($parent, fld);
        fld.folder = fld.val;
        var $fld = $$div({
            html: fld.folder ? fld.folder.path : fld.label, click: onClick, class: 'btn', style: 'margin-top: 10px; width: 98%;'
        }).appendTo($parent);

        function onClick() {
            ui.addLayer({ footer: true });
            onBack.add(ui.removeLayer);
            tools.gd_explorer.start({
                selectFolder: true, onSelect: function (folders) {
                    ui.removeLayer();
                    var path = '';
                    for (var i = 1; i < folders.length; i++) {
                        path += '/' + folders[i].name;
                    }
                    var currFolder = folders[folders.length - 1];

                    $fld.html(path);
                    fld.folder = { path: path, id: currFolder.id };
                }
            });
        };
        return $fld;
    };


    return {
        create: create,
        appendLabel: appendLabel,
        appendInput: appendInput,
    }
})();

ui.header = (function () {
    function render(opts) {
        var $headerDiv = ui.getEmptyHeaderDiv();
        var $table = $$table({ style: 'width: 100%;' }).appendTo($headerDiv);
        var $tr = $$tr().appendTo($table);

        if (opts.nav) {
            var nav = opts.nav;
            if ($.isArray(opts.nav)) {
                nav = function () { ui.nav.renderLeft(opts.nav); };
            }
            var $ele = headerIconTd('mi_menu', nav);
            $ele.appendTo($tr);
        }
        if (opts.atHome) {
            var $ele = headerIconTd('mi_power_settings_new', function () { Native_Main.exit(); });
            $ele.appendTo($tr);
        }
        else {
            var $ele = headerIconTd('mi_home', main.start);
            $ele.appendTo($tr);
        }
        if (onBack.has() && !onBack.backIsHome()) {
            var $ele = headerIconTd('mi_arrow_back', onBack.back);
            $ele.appendTo($tr);
        }

        var ele = {
            typ: 'td', class: 'header_title_td', css: { width: '99%' }, html: opts.title,
        };
        var $ele = ui.ele.build(ele);
        $ele.appendTo($tr);

        if (opts.add) {
            var $ele = headerIconTd('mi_add', opts.add);
            $ele.appendTo($tr);
        }
        if (opts.menu) {
            var menu = opts.menu;
            if ($.isArray(opts.menu)) {
                menu = function () { ui.nav.renderRight(opts.menu); };
            }
            var $ele = headerIconTd('mi_more_vert', menu);
            $ele.appendTo($tr);
        }
    };

    function headerIconTd(icon, func) {
        var $td = $$td({ class: 'header_icon_td', click: func });
        $$img({ src: 'svg/' + icon + color.hdrFill, style: 'width: 2rem; height: 2rem;' }).appendTo($td);
        return $td;
    };

    function setTitle(title) {
        $('.header_title_td').html(title);
    };

    return { render: render, setTitle: setTitle };

})();

ui.nav = (function () {
    function renderLeft(items) {
        var $headerDiv = ui.getHeaderDiv();
        var headerHeight = $headerDiv[0].offsetHeight;
        var totalHeight = $('body')[0].offsetHeight;

        var ele = { id: 'NavDiv', class: 'nav_div', css: { top: (headerHeight - 1) + 'px', height: (totalHeight - headerHeight + 1) + 'px' } };
        var $nav_div = $$div(ele);
        buildLeft($nav_div, items, false);

        var $bg = ui.dialogBackGround({ animation: 'navSlideOut' });
        $nav_div.appendTo($bg);
    };

    function buildLeft($nav_div, items, showAccts) {
        $nav_div.empty();

        var $acct_div = $$div({ style: 'padding: 10px; color: white; background-color: lightseagreen;' });
        $acct_div.appendTo($nav_div);


        if (showAccts) {
            var accounts = db.ctrl.get('accounts') || {};
            $.each(accounts, function (email, acct) {
                if (account.email == email) return;
                var title = '';
                if (acct.displayName && acct.displayName != email)
                    title = acct.displayName + '<br />' + email;
                else title = email;
                var item = {
                    icon: 'mi_person_outline', title: title, func: function () { Native_Main.signIn(email); }
                };
                var $div = renderItem($nav_div, item);
                $div.css({ 'margin-top': '10px', 'margin-bottom': '10px' });
            });

            var item = {
                icon: 'mi_people_outline', title: 'Sign Out', func: function () { Native_Main.signOut(); }
            };
            renderItem($nav_div, item);
        } else {
            for (var i = 0; i < items.length; i++) {
                renderItem($nav_div, items[i]);
            }
        }
    };

    function renderRight(items) {
        var $headerDiv = ui.getHeaderDiv();
        var headerHeight = $headerDiv[0].offsetHeight;
        var ele = { typ: 'div', id: 'NavDiv', class: 'menu_div', css: { top: (headerHeight - 1) + 'px', } };

        var $nav_div = ui.ele.build(ele);
        for (var i = 0; i < items.length; i++) {
            renderItem($nav_div, items[i]);
        }

        var $bg = ui.dialogBackGround({ animation: 'menuSlideOut' });
        $nav_div.appendTo($bg);
    };

    function renderItem($parent, item) {
        var $div = $$div({ style: 'display: table; color: gray; width: 100%;' }).appendTo($parent);
        if (item.separator) {
            $$div({ style: 'border-bottom: 1px solid lightgray; width: 90%; margin-left: 5%;' }).appendTo($div);
            return;
        }
        var $icon_div = $$div({ class: 'menu_item' }).appendTo($div);
        if (item.icon) $$img({ src: 'svg/' + item.icon + color.mnuFill, style: 'width: 1.75rem; height: 1.75rem;' }).appendTo($icon_div);
        var $txt_div = $$div({ style: 'display: table-cell; vertical-align: middle; padding-right: 10px;' }).appendTo($div);
        $$span({ html: item.title, class: 'unselectable menu_item_txt' }).appendTo($txt_div);
        $div.click(function () {
            $('.dialog_bg').click();
            if (item.func) {
                item.func();
                if (item.backFunc) {
                    onBack.add(item.backFunc);
                }
            }
        });
        return $div;
    };
    return { renderLeft: renderLeft, renderRight: renderRight };
})();

ui.dargDrop = (function () {

    function start($container, dragElements, onDrop) {
        var dragEle = null;
        var dropEle = null;
        var hasDrag = false;

        function getParent(ele) {
            while (ele.parentElement != $container[0]) {
                ele = ele.parentElement;
                if (!ele) return null;
            }
            return ele;
        }

        dragElements.attr({ draggable: 'true' });

        dragElements.on('dragstart', function (event) {
            var ev = event.originalEvent;
            dragEle = event.target;
            var dataTransfer = ev.dataTransfer;
            dataTransfer.setData('text', 'dummy');
            dataTransfer.effectAllowed = 'move';
            $container.children('.drag_ele').removeClass('drag_ele');
            $(dragEle).addClass('drag_ele');
        });

        dragElements.on('dragover', function (event) {
            hasDrag = true;
            var ev = event.originalEvent;
            var target = event.target;
            target = getParent(target);
            if (target != dropEle) {
                dropEle = target;
                $container.children('.drop_ele').removeClass('drop_ele');
                $(dropEle).addClass('drop_ele');
            }
            ev.preventDefault();
        });

        dragElements.on('drop', function (event) {
            var ev = event.originalEvent;
            //var target = event.target;
            //dropEle = getParent(target);
            $container.children('.drag_ele').removeClass('drag_ele');
            $container.children('.drop_ele').removeClass('drop_ele');
            onDrop(dragEle, dropEle);
            ev.preventDefault();
        });

        $container.on("touchmove", function (event) {
            if (hasDrag || dragEle == null) return;
            var ev = event.originalEvent;
            if (!ev.changedTouches || ev.changedTouches.length == 0) return;
            var changedTouch = ev.changedTouches[0];
            if (!changedTouch) return;
            var target = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
            if (target == null) return;
            target = getParent(target);
            if (target == null) return;
            if (target != dropEle) {
                dropEle = target;
                $container.children('.drop_ele').removeClass('drop_ele');
                $(dropEle).addClass('drop_ele');
            }
            ev.preventDefault();
        });

        $container.on("touchend", function (event) {
            if (hasDrag || dragEle == null || dropEle == null) return;
            $container.children('.drag_ele').removeClass('drag_ele');
            $container.children('.drop_ele').removeClass('drop_ele');
            var ev = event.originalEvent;
            ev.preventDefault();
            onDrop(dragEle, dropEle);
            dragEle = null;
            dropEle = null;
        });
    };

    return { start: start };
})();

ui.ele = (function () {
    function build(opts) {
        var typ = opts.typ;
        var $e = $('<' + typ + '/>');

        for (var key in opts) {
            var valu = opts[key];
            if (key == 'typ') { }
            else if (key == 'attr') $e.attr(valu);
            else if (key == 'css') $e.css(valu);
            else if (key == 'html') $e.html(valu);
            else if (key == 'val') $e.val(valu);
            else if (key == 'click') $e.click(valu);
            else if (key == 'child') {
                var $child = build(valu);
                $child.appendTo($e);
            }
            else if (key == 'children') {
                for (var j = 0; j < valu.length; j++) {
                    var $child = build(valu[j]);
                    $child.appendTo($e);
                }
            }
            else $e.attr(key, valu);
        }
        return $e;
    };

    return {
        build: build,
    };
})();

function $$(ele) {
    return ui.ele.build(ele);
}

function $$div(ele) {
    var ele = ele || {};
    ele.typ = 'div';
    return ui.ele.build(ele);
}

function $$span(ele) {
    var ele = ele || {};
    ele.typ = 'span';
    return ui.ele.build(ele);
}

function $$img(ele) {
    var ele = ele || {};
    ele.typ = 'img';
    return ui.ele.build(ele);
}

function $$input(ele) {
    var ele = ele || {};
    ele.typ = 'input';
    return ui.ele.build(ele);
}

function $$label(ele) {
    var ele = ele || {};
    ele.typ = 'label';
    return ui.ele.build(ele);
}

function $$table(ele) {
    var ele = ele || {};
    ele.typ = 'table';
    return ui.ele.build(ele);
}

function $$tr(ele) {
    var ele = ele || {};
    ele.typ = 'tr';
    return ui.ele.build(ele);
}

function $$td(ele) {
    var ele = ele || {};
    ele.typ = 'td';
    return ui.ele.build(ele);
}

function $$a(ele) {
    var ele = ele || {};
    ele.typ = 'a';
    return ui.ele.build(ele);
}

function $$button(ele) {
    var ele = ele || {};
    ele.typ = 'button';
    return ui.ele.build(ele);
}

function $$fieldset(ele) {
    var ele = ele || {};
    ele.typ = 'fieldset';
    return ui.ele.build(ele);
}

function $$legend(ele) {
    var ele = ele || {};
    ele.typ = 'legend';
    return ui.ele.build(ele);
}

function $$fieldsetAndlegend(title) {
    var ele = { typ: 'fieldset', child: { typ: 'legend', html: title } };
    return ui.ele.build(ele);
}


function $$svg(ele) {
    var svg = {
        typ: 'svg', style: 'width: ' + ele.size + 'px; height: ' + ele.size + 'px', viewBox: '0 0 24 24',
        child: { typ: 'path', fill: ele.fill, d: ele.icon }
    };
    return $(ui.toHtml(svg));
}

var mi_icon = {
    arrow_drop_down: 'M7 10l5 5 5-5z',
    arrow_drop_up: 'M7 14l5-5 5 5z',
};