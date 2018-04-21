"use strict";

var audit_case = (function () {

    function addCase() {
        var opts = {
            title: 'Create Case',
            fields: {
                legal_name: { typ: 'text', label: 'Legal Name', required: true, placeholder: 'Enter Legal Name' },
            }
        };

        var form = ui.form.create(opts);
        form.onSubmit = function (valuMap) {
            var key = db.createKey();
            var data = {
                tp: {
                    legal_name: valuMap.legal_name, physical_address: {}, mailing_address: {}, initial_contact: {}, representative: {}
                }, primary_auditor: {}, details: {}, supervisor: {}, audit_period: {}
            };
            db.audit_case.add(key, data).then(renderList);
        };
    };

    function renderList() {
        var $listDiv = $('#case_list_div');
        $listDiv.empty();
        util.callAjax('db', 'getAll', { tname: 'audit_case' }).then(function (map) {
            $.each(map, function (id, data) {
                var txt = '<b>Legal Name:</b> ' + data.tp.legal_name + ' <b>Virginia Id:</b> ' + data.tp.virginia_id + ' <b>FEIN:</b> ' + data.tp.FEIN +
                    '<br><b>Primary Auditor:</b> ' + data.primary_auditor.name;

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
            title: data.tp.legal_name,
        };
        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();
        var $dataDiv = ui.getDataDiv();
        var $dtlsec_hdr = $$button({ class: 'dtlsec_hdr', html: 'Taxpayer Information' }).appendTo($dataDiv);
        taxpayerInformation($dtlsec_hdr);
        var $dtlsec_hdr = $$button({ class: 'dtlsec_hdr', html: 'Audit Information' }).appendTo($dataDiv);
        auditInformation($dtlsec_hdr);
        var $dtlsec_hdr = $$button({ class: 'dtlsec_hdr', html: 'Supervisor Information' }).appendTo($dataDiv);
        supervisorInformation($dtlsec_hdr);
        var $dtlsec_hdr = $$button({ class: 'dtlsec_hdr', html: 'Audit Years' }).appendTo($dataDiv);
        auditYears($dtlsec_hdr);

        $('.dtlsec_hdr').click(function () {
            var $btn = $(this);
            $btn.toggleClass('active');
            var $dtlsec = $btn.next();
            if ($dtlsec.css('max-height') != '0px') {
                $dtlsec.css('max-height', 0);
                $dtlsec.css('padding', 0);
            } else {
                $dtlsec.css('padding', 5);
                $dtlsec.css('max-height', $dtlsec[0].scrollHeight);
            }
        });
    };

    function taxpayerInformation($dtlsec_hdr) {
        var $dtlsec = $('#tp_info');
        if ($dtlsec.length == 0) $dtlsec = $$div({ id: 'tp_info', class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        $dtlsec.empty();

        var $fieldSet = $$fieldsetAndlegend('General Information').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Legal Name: ', style: 'text-align: right;' }).appendTo($tr);
        var $td = $$td({ colspan: 5 }).appendTo($tr);
        var $legal_name = $$input({ size: 50, style: 'width: 100%;' }).val(data.tp.legal_name).appendTo($td);

        var $tr = $$tr().appendTo($table);
        $$td({ html: 'VA ID: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $virginia_id = $$input({ size: 15 }).val(data.tp.virginia_id).appendTo($td);
        $$td({ html: 'FEIN: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $FEIN = $$input({ size: 15 }).val(data.tp.FEIN).appendTo($td);
        $$td({ html: 'Compliance Code: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $compliance_code = $$input({ size: 5 }).val(data.tp.compliance_code).appendTo($td);

        var paddr = data.tp.physical_address;
        var $fieldSet = $$fieldsetAndlegend('Physical Address').appendTo($dtlsec);
        $fieldSet.css({ display: 'inline-block', width: '49.7%' });
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Street: ', style: 'text-align:right;vertical-align: top;' }).appendTo($tr);
        var $td = $$td({ colspan: 3 }).appendTo($tr);
        var $pstreet = $$({ typ: 'textarea', rows: 3 }).val(paddr.street).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'City: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 3 }).appendTo($tr);
        var $pcity = $$input({ size: 50 }).val(paddr.city).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'State: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pstate = $$input({ size: 2 }).val(paddr.state).appendTo($td);
        $$td({ html: 'Zip: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pzip = $$input({ size: 10 }).val(paddr.zip).appendTo($td);

        var maddr = data.tp.mailing_address;
        var $fieldSet = $$fieldsetAndlegend('Mailing Address').appendTo($dtlsec);
        $fieldSet.css({ display: 'inline-block', width: '49.7%' });
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Street: ', style: 'text-align:right;vertical-align: top;' }).appendTo($tr);
        var $td = $$td({ colspan: 3 }).appendTo($tr);
        var $mstreet = $$({ typ: 'textarea', rows: 3 }).val(maddr.street).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'City: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 3 }).appendTo($tr);
        var $mcity = $$input({ size: 50 }).val(maddr.city).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'State: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $mstate = $$input({ size: 2 }).val(maddr.state).appendTo($td);
        $$td({ html: 'Zip: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $mzip = $$input({ size: 10 }).val(maddr.zip).appendTo($td);

        var $table = $$table().appendTo($dtlsec);
        var $tr = $$tr().appendTo($table);
        var $td = $$td().appendTo($tr);
        $$a({ html: 'Ok', click: save }).appendTo($td);

        function save() {
            data.tp.legal_name = $legal_name.val();
            data.tp.virginia_id = $virginia_id.val();
            data.tp.FEIN = $FEIN.val();
            data.tp.compliance_code = $compliance_code.val();

            paddr.street = $pstreet.val();
            paddr.city = $pcity.val();
            paddr.state = $pstate.val();
            paddr.zip = $pzip.val();

            maddr.street = $mstreet.val();
            maddr.city = $mcity.val();
            maddr.state = $mstate.val();
            maddr.zip = $mzip.val();

            db.audit_case.set(id, data).then(function () { taxpayerInformation($dtlsec_hdr); });
        }
    };

    function auditInformation($dtlsec_hdr) {
        var $dtlsec = $$div({ class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        var $fieldSet = $$fieldsetAndlegend('General Information').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'auditInformation: ', style: 'text-align:right;' }).appendTo($tr);
    };

    function supervisorInformation($dtlsec_hdr) {
        var $dtlsec = $$div({ class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        var $fieldSet = $$fieldsetAndlegend('General Information').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'supervisorInformation: ', style: 'text-align:right;' }).appendTo($tr);
    };

    function auditYears($dtlsec_hdr) {
        var $dtlsec = $$div({ class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        var $fieldSet = $$fieldsetAndlegend('General Information').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'auditYears: ', style: 'text-align:right;' }).appendTo($tr);
    };


    return {
        render: render,
    };
})();

