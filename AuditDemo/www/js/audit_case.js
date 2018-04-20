"use strict";

var audit_case = (function () {

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
            db.audit_case.add(key, valuMap).then(renderList);
        };
    };

    function renderList() {
        var $listDiv = $('#case_list_div');
        $listDiv.empty();
        util.callAjax('db', 'getAll', { tname: 'audit_case' }).then(function (map) {
            $.each(map, function (id, data) {
                var txt = '<b>Legal Name:</b> ' + data.ta.legal_name + ' <b>Virginia Id:</b> ' + data.ta.virginia_id + ' <b>FEIN:</b> ' + data.ta.FEIN +
                    '<br><b>Primary Auditor:</b> ' + data.setup.primary_auditor.name;

                $$div({
                    html: txt, class: 'card_1', style: 'cursor: pointer;', click: function () {
                        audit_case_detail.render(id, data);
                    }
                }).appendTo($listDiv);
            });
        });
    };

    return {
        addCase: addCase,
        renderList: renderList,
    };
})();

var audit_case_detail = (function () {
    var $menuTd;
    var $detailTd;
    var id;
    var data;

    function render(key, dat) {
        id = key;
        data = dat;
        var opts = {
            title: data.ta.legal_name,
        };
        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();

        var $table = $$table({ style: 'width: 100%' }).appendTo($dataDiv);
        var $tr = $$tr().appendTo($table);
        $menuTd = $$td({ style: 'width: 1%; vertical-align:top; padding:10px;' }).appendTo($tr);
        $detailTd = $$td({ style: 'width: 99%; vertical-align: top; padding:10px;' }).appendTo($tr);

        renderMenuItem('Taxpayer Information', taxpayerInformation);
        renderMenuItem('Audit Information', function () { $detailTd.html('Audit Information'); });
        renderMenuItem('Supervisor Information', function () { $detailTd.html('Supervisor Information'); });
        renderMenuItem('Audit Years', function () { $detailTd.html('Audit Years'); });
    };

    function renderMenuItem(txt, func) {
        $$div({
            style: 'white-space: nowrap; margin:10px;', child: {
                typ: 'a', html: txt, click: func
            }
        }).appendTo($menuTd);
    };

    function taxpayerInformation() {
        $detailTd.empty();
        var $fieldSet = $$fieldsetAndlegend('General Information').appendTo($detailTd);

        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Legal Name: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 5 }).appendTo($tr);
        var $legal_name = $$input({ size: 50 }).val(data.ta.legal_name).appendTo($td);

        var $tr = $$tr().appendTo($table);
        $$td({ html: 'VA ID: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $virginia_id = $$input({ size: 15 }).val(data.ta.virginia_id).appendTo($td);
        $$td({ html: 'FEIN: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $FEIN = $$input({ size: 15 }).val(data.ta.FEIN).appendTo($td);
        $$td({ html: 'Compliance Code: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $compliance_code = $$input({ size: 5 }).val(data.ta.compliance_code).appendTo($td);

        var $tr = $$tr().appendTo($table);
        var $td = $$td().appendTo($tr);
        $$a({ html: 'Ok', click: save }).appendTo($td);

        function save() {
            data.ta.legal_name = $legal_name.val();
            data.ta.virginia_id = $virginia_id.val();
            data.ta.FEIN = $FEIN.val();
            data.ta.compliance_code = $compliance_code.val();
            db.audit_case.set(id, data).then(taxpayerInformation);
        }
    };

    return {
        render: render,
    };
})();

