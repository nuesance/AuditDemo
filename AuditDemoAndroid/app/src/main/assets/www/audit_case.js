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
                }, primary_auditor: {}, details: {}, supervisor: {}, audit_period: {}, loc_id: settings.loc_id,
            };
            db.audit_case.add(key, data);
            renderList();
        };
    };

    function renderList() {
        var $listDiv = $('#case_list_div');
        $listDiv.empty();
        var map = db.audit_case.getAll();
        $.each(map, function (id, data) {
            var txt = '<b>Legal Name:</b> ' + data.tp.legal_name + ' <b>Virginia Id:</b> ' + data.tp.virginia_id + ' <b>FEIN:</b> ' + data.tp.FEIN +
                '<br><b>Primary Auditor:</b> ' + data.primary_auditor.auditor;

            $$div({
                html: txt, class: 'card_1', style: 'cursor: pointer;', click: function () {
                    audit_case_detail.render(id, data);
                }
            }).appendTo($listDiv);
        });
    };

    function listFromServer() {
        var $listDiv = $('#case_list_div');
        $listDiv.empty();
        util.callAjaxSrv('db', 'getAll', { tname: 'audit_case' }).then(function (map) {
            $.each(map, function (id, data) {
                var txt = '<b>Legal Name:</b> ' + data.tp.legal_name + ' <b>Virginia Id:</b> ' + data.tp.virginia_id + ' <b>FEIN:</b> ' + data.tp.FEIN +
                    '<br><b>Primary Auditor:</b> ' + data.primary_auditor.auditor;

                $$div({
                    html: txt, class: 'card_1', style: 'cursor: pointer;', click: function () {
                        audit_case_detail.render(id, data, true);
                    }
                }).appendTo($listDiv);
            });
        });
    };

    return {
        addCase: addCase,
        renderList: renderList,
        listFromServer: listFromServer,
    };
})();

var audit_case_detail = (function () {
    var $menuTd;
    var $detailTd;
    var id;
    var data;
    var editable;

    function render(key, dat, fromServer) {
        id = key;
        data = dat;
        editable = data.loc_id == settings.loc_id;

        var opts = {
            title: data.tp.legal_name,
            menu: []
        };
        if (editable && !fromServer) {
            opts.menu.push({ icon: 'mi_sync', title: 'Sync', func: sync });
            opts.menu.push({ icon: 'mi_keyboard_arrow_up', title: 'Check-in', func: checkin });
        }

        if (fromServer && !data.loc_id) {
            opts.menu.push({ icon: 'mi_keyboard_arrow_down', title: 'Check-out', func: checkout });
        }
        if (opts.menu.length == 0) delete opts.menu;
        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();
        if (editable) {
            var $tp_hdr = $$div({ class: 'dtlsec_hdr', html: 'Taxpayer Information' }).appendTo($dataDiv);
            taxpayerInformation($tp_hdr);
            var $ai_hdr = $$div({ class: 'dtlsec_hdr', html: 'Audit Information' }).appendTo($dataDiv);
            auditInformation($ai_hdr);
            var $si_hdr = $$div({ class: 'dtlsec_hdr', html: 'Supervisor Information' }).appendTo($dataDiv);
            supervisorInformation($si_hdr);
            var $ay_hdr = $$div({ class: 'dtlsec_hdr', html: 'Audit Years' }).appendTo($dataDiv);
            auditYears($ay_hdr);
        }
        var $summary = $$div({ class: 'dtlsec_hdr', html: 'Summary' }).appendTo($dataDiv);
        summary($summary);

        $('.dtlsec_hdr').click(function () {
            var $btn = $(this);
            var $dtlsec = $btn.next();
            var expand = $dtlsec.css('max-height') == '0px';
            $('.dtlsec').css({ 'max-height': 0 });
            $('.dtlsec_hdr').removeClass('active');
            if (expand) {
                $btn.addClass('active');
                $dtlsec.css('max-height', $dtlsec[0].scrollHeight);
                //                $dtlsec.css('max-height', '100%');
            }
        });

        if (editable) {
            $tp_hdr.click();
        } else {
            $summary.click();
        }

    };

    function sync() {
        util.callAjaxSrv('db', 'get', { tname: 'audit_case', id: id }).then(function (srvData) {
            util.callAjaxSrv('db', 'put', { tname: 'audit_case', id: id, data: util.buff.stringify(data) }).then(function () {
                ui.toast('Synced');
            });
        });
    }

    function checkin() {
        delete data.loc_id;
        db.audit_case.set(id, data);
        sync();
    }

    function checkout() {
        data.loc_id = settings.loc_id;
        db.audit_case.put(id, data);
        sync();
    }

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
        $$td({ html: 'Virginia Id: ', style: 'text-align:right;' }).appendTo($tr);
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

        var inicontact = data.tp.initial_contact;
        var $fieldSet = $$fieldsetAndlegend('Initial Contact').appendTo($dtlsec);
        $fieldSet.css({ display: 'iniline-block', width: '49.7%' });
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Name: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $icname = $$input({ size: 30 }).val(inicontact.name).appendTo($td);
        $$td({ html: 'Phone: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $icphone = $$input({ size: 15 }).val(inicontact.phone).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $icphoneext = $$input({ size: 10 }).val(inicontact.phone_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Title: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $ictitle = $$input({ size: 30 }).val(inicontact.title).appendTo($td);
        $$td({ html: 'Fax: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $icfax = $$input({ size: 15 }).val(inicontact.fax).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $icfaxext = $$input({ size: 10 }).val(inicontact.fax_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Email: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 5 }).appendTo($tr);
        var $icemail = $$input({ size: 30 }).val(inicontact.email).appendTo($td);

        var representative = data.tp.representative;
        var $fieldSet = $$fieldsetAndlegend('Representative Worked With').appendTo($dtlsec);
        $fieldSet.css({ display: 'iniline-block', width: '49.7%' });
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Name: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $repname = $$input({ size: 30 }).val(representative.name).appendTo($td);
        $$td({ html: 'Phone: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $repphone = $$input({ size: 15 }).val(representative.phone).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $repphoneext = $$input({ size: 10 }).val(representative.phone_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Title: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $reptitle = $$input({ size: 30 }).val(representative.title).appendTo($td);
        $$td({ html: 'Fax: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $repfax = $$input({ size: 15 }).val(representative.fax).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $repfaxext = $$input({ size: 10 }).val(representative.fax_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Email: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 5 }).appendTo($tr);
        var $repemail = $$input({ size: 50 }).val(representative.email).appendTo($td);

        var $table = $$table().appendTo($dtlsec);
        var $tr = $$tr().appendTo($table);
        var $td = $$td().appendTo($tr);
        $$button({ html: 'OK', click: save }).appendTo($td);
        $$button({
            html: 'Cancel', click: function () {
                taxpayerInformation($dtlsec_hdr);
                $dtlsec_hdr.click();
            }
        }).appendTo($td);

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

            inicontact.name = $icname.val();
            inicontact.phone = $icphone.val();
            inicontact.phone_ext = $icphoneext.val();
            inicontact.title = $ictitle.val();
            inicontact.fax = $icfax.val();
            inicontact.fax_ext = $icfaxext.val();
            inicontact.email = $icemail.val();

            representative.name = $repname.val();
            representative.phone = $repphone.val();
            representative.phone_ext = $repphoneext.val();
            representative.title = $reptitle.val();
            representative.fax = $repfax.val();
            representative.fax_ext = $repfaxext.val();
            representative.email = $repemail.val();

            db.audit_case.set(id, data);
            taxpayerInformation($dtlsec_hdr);
            $dtlsec_hdr.click();
        }
    };

    function auditInformation($dtlsec_hdr) {
        var $dtlsec = $('#audit_info');
        if ($dtlsec.length == 0) $dtlsec = $$div({ id: 'audit_info', class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        $dtlsec.empty();
        $$span({ html: "The following general information about the audit must be entered before any audit information can be entered or computed.", style: "display:block; padding:10px;" }).appendTo($dtlsec);

        var pauditor = data.primary_auditor;
        var $fieldset = $$fieldsetAndlegend('Primary Auditor').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldset);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Auditor: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_auditor = $$input({ size: 30 }).val(pauditor.auditor).appendTo($td);
        $$td({ html: 'District: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 4 }).appendTo($tr);
        var $pa_district = $$input({ size: 30 }).val(pauditor.district).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Title: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_title = $$input({ size: 30 }).val(pauditor.title).appendTo($td);
        $$td({ html: 'Phone: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_phone = $$input({ size: 20 }).val(pauditor.phone).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_phone_ext = $$input({ size: 5 }).val(pauditor.phone_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Address: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_address = $$input({ size: 30 }).val(pauditor.address).appendTo($td);
        $$td({ html: 'Fax: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_fax = $$input({ size: 20 }).val(pauditor.fax).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_fax_ext = $$input({ size: 5 }).val(pauditor.fax_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'City, ST Zip: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_city_st_zip = $$input({ size: 30 }).val(pauditor.city_st_zip).appendTo($td);
        $$td({ html: 'E-mail: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 4 }).appendTo($tr);
        var $pa_email = $$input({ size: 30 }).val(pauditor.email).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'User ID:', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $pa_user_id = $$input({ size: 15 }).val(pauditor.user_id).appendTo($td);
        $$button({ html: 'Save to OCR Profiles' }).appendTo($$td({ colspan: 2 }).appendTo($tr));
        $$button({ html: 'Load from OCR Profiles' }).appendTo($$td({ colspan: 2 }).appendTo($tr));

        var details = data.details;
        var $fieldset = $$fieldsetAndlegend('Details').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldset);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Parent Corp. Legal Name: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 3 }).appendTo($tr);
        var $d_legal_name = $$input({ style: 'width:100%;' }).val(details.legal_name).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Filing Status: ', style: 'text-align:right;' }).appendTo($tr);
        $$span({ html: 'Radios here' }).appendTo($$td().appendTo($tr));
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Workpaper ID: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $d_workpaper_id = $$input({ size: 30 }).val(details.workpaper_id).appendTo($td);
        $$td({ html: 'Date Audit Began: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $d_date_began = $$input({ size: 20 }).val(details.date_began).appendTo($td);

        var $table = $$table().appendTo($dtlsec);
        var $tr = $$tr().appendTo($table);
        var $td = $$td().appendTo($tr);
        $$button({ html: 'OK', click: save }).appendTo($td);
        $$button({
            html: 'Cancel', click: function () {
                taxpayerInformation($dtlsec_hdr);
                $dtlsec_hdr.click();
            }
        }).appendTo($td);

        function save() {
            pauditor.auditor = $pa_auditor.val();
            pauditor.title = $pa_title.val();
            pauditor.address = $pa_address.val();
            pauditor.city_st_zip = $pa_city_st_zip.val();
            pauditor.district = $pa_district.val();
            pauditor.phone = $pa_phone.val();
            pauditor.phone_ext = $pa_phone_ext.val();
            pauditor.fax = $pa_fax.val();
            pauditor.fex_ext = $pa_fax_ext.val();
            pauditor.email = $pa_email.val();
            pauditor.user_id = $pa_user_id.val();

            details.legal_name = $d_legal_name.val();
            details.workpaper_id = $d_workpaper_id.val();
            details.date_began = $d_date_began.val();

            db.audit_case.set(id, data);
            taxpayerInformation($dtlsec_hdr);
            $dtlsec_hdr.click();
        }
    };

    function supervisorInformation($dtlsec_hdr) {
        var $dtlsec = $('#supervisor_info');
        if ($dtlsec.length == 0) $dtlsec = $$div({ id: 'supervisor_info', class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        $dtlsec.empty();
        $$span({ html: "Please select the Audit Supervisor infromation you awnat to use for the Audit Adjustments Summary (A;; Years) Audit Report and when creating audit correspondence.", style: "display:block; padding:10px;" }).appendTo($dtlsec);

        $$span({ html: "Who is the Audit Supervisor on this audit?", style: "display:block; margin-top:16px; padding:10px;" }).appendTo($dtlsec);

        var supervisor = data.supervisor;
        var $table = $$table().appendTo($dtlsec);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Supervisor: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_supervisor = $$input({ size: 30 }).val(supervisor.supervisor).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Title: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_title = $$input({ size: 30 }).val(supervisor.title).appendTo($td);
        $$td({ html: 'Phone: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_phone = $$input({ size: 20 }).val(supervisor.phone).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_phone_ext = $$input({ size: 5 }).val(supervisor.phone_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Address: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_address = $$input({ size: 30 }).val(supervisor.address).appendTo($td);
        $$td({ html: 'Fax: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_fax = $$input({ size: 20 }).val(supervisor.fax).appendTo($td);
        $$td({ html: 'Ext: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_fax_ext = $$input({ size: 5 }).val(supervisor.fax_ext).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'City, ST Zip: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td().appendTo($tr);
        var $s_city_st_zip = $$input({ size: 30 }).val(supervisor.city_st_zip).appendTo($td);
        $$td({ html: 'E-mail: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ colspan: 4 }).appendTo($tr);
        var $s_email = $$input({ size: 30 }).val(supervisor.email).appendTo($td);
        var $tr = $$tr().appendTo($table);
        $$button({ html: 'Save to OCR Profiles' }).appendTo($$td({ colspan: 3 }).appendTo($tr));
        $$button({ html: 'Load from OCR Profiles' }).appendTo($$td({ colspan: 3 }).appendTo($tr));

        var $table = $$table().appendTo($dtlsec);
        var $tr = $$tr().appendTo($table);
        var $td = $$td().appendTo($tr);
        $$button({ html: 'OK', click: save }).appendTo($td);
        $$button({
            html: 'Cancel', click: function () {
                taxpayerInformation($dtlsec_hdr);
                $dtlsec_hdr.click();
            }
        }).appendTo($td);

        function save() {
            supervisor.supervisor = $s_supervisor.val();
            supervisor.title = $s_title.val();
            supervisor.address = $s_address.val();
            supervisor.city_st_zip = $s_city_st_zip.val();
            supervisor.district = $s_district.val();
            supervisor.phone = $s_phone.val();
            supervisor.phone_ext = $s_phone_ext.val();
            supervisor.fax = $s_fax.val();
            supervisor.fex_ext = $s_fax_ext.val();
            supervisor.email = $s_email.val();

            db.audit_case.set(id, data);
            taxpayerInformation($dtlsec_hdr);
            $dtlsec_hdr.click();
        }
    };

    function auditYears($dtlsec_hdr) {
        var $dtlsec = $('#audit_years');
        if ($dtlsec.length == 0) $dtlsec = $$div({ id: 'audit_years', class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        $dtlsec.empty();
        $$span({ html: "What are the years that you are auditing?", style: "display:block; padding:10px;" }).appendTo($dtlsec);

        var ap = data.audit_period;
        var $table = $$table().appendTo($dtlsec);
        var $tr = $$tr().appendTo($table);
        var $td = $$td().appendTo($tr);
        var $td_year_dtl = $$td().appendTo($tr);
        for (var year in data.audit_period) {
            var $span = $$span({ class: 'ap_year', 'data-year': year, html: year, style: 'display:block;cursor:pointer;' }).appendTo($td);
        }
        $('.ap_year').click(function () {
            loadYear($(this).attr('data-year'));
        });
        $('.ap_year:first').click();
        function loadYear(year) {
            var period = ap[year];
            $td_year_dtl.empty();
            var $fieldset = $$fieldsetAndlegend('Taxable Year').appendTo($td_year_dtl);
            var $table = $$table().appendTo($fieldset);
            var $tr = $$tr().appendTo($table);
            var $td = $$td().appendTo($tr);
            $$input({ type: 'radio', name: 'year_type' }).prop('checked', true).appendTo($td);
            var $td = $$td({ colspan: 2 }).appendTo($tr);
            $$span({ html: 'Calender Year' }).appendTo($td);
            var $td = $$td().appendTo($tr);
            $$input({ type: 'radio', name: 'year_type' }).appendTo($td);
            var $td = $$td({ colspan: 3 }).appendTo($tr);
            $$span({ html: 'Fiscal Year', style: 'display:block' }).appendTo($td);
            var $tr = $$tr().appendTo($table);
            $$td().appendTo($tr);
            var $td = $$td().appendTo($tr);
            var $ap_year = $$input({ size: 5 }).val(period.year).appendTo($td);
            $$td({ html: '(YYYY)', style: 'width:100px;' }).appendTo($tr);
            $$td().appendTo($tr);
            $$td({ html: 'Begin Date:', style: 'text-align:right;' }).appendTo($tr);
            var $td = $$td().appendTo($tr);
            var $ap_begin_date = $$input({ size: 5, style: 'display:block' }).val(period.begin_date).appendTo($td);
            $$td({ html: 'MM/DD/YY' }).appendTo($tr);
            var $tr = $$tr().appendTo($table);
            $$td({ colspan: 4 }).appendTo($tr);
            $$td({ html: 'End Date:', style: 'text-align:right;' }).appendTo($tr);
            var $td = $$td().appendTo($tr);
            var $ap_end_date = $$input({ size: 5, style: 'display:block' }).val(period.end_date).appendTo($td);
            $$td({ html: 'MM/DD/YY' }).appendTo($tr);

            var $td = $$td().appendTo($tr);
            var $fieldset = $$fieldsetAndlegend('Options').appendTo($td_year_dtl);
            var $table = $$table().appendTo($fieldset);
            var $tr = $$tr().appendTo($table);
            var $td = $$td().appendTo($tr);
            var $ap_return_filed = $$input({ type: 'checkbox' }).prop('checked', period.return_filed).appendTo($td);
            $$td({ html: 'Return Filed' }).appendTo($tr);
            var $td = $$td().appendTo($tr);
            var $ap_extension_filed = $$input({ type: 'checkbox' }).prop('checked', period.extension_filed).appendTo($td);
            $$td({ html: 'Extension Filed', colspan: 3 }).appendTo($tr);
            var $tr = $$tr().appendTo($table);
            var $td = $$td().appendTo($tr);
            var $ap_final_return = $$input({ type: 'checkbox' }).prop('checked', period.final_return).appendTo($td);
            $$td({ html: 'Final Return' }).appendTo($tr);
            var $td = $$td().appendTo($tr);
            $$td({ html: 'Extended Thru: ' }).appendTo($tr);
            var $td = $$td().appendTo($tr);
            var $ap_extended_thru = $$input().val(period.extended_thru).appendTo($td);
            $$td({ html: 'MM/DD/YY' }).appendTo($tr);
            var $tr = $$tr().appendTo($table);
            var $td = $$td().appendTo($tr);
            var $ap_multistate_corp = $$input({ type: 'checkbox' }).prop('checked', period.multistate_corp).appendTo($td);
            $$td({ html: 'Multistate Corporation' }).appendTo($tr);
            var $tr = $$tr().appendTo($table);
            var $td = $$td().appendTo($tr);
            var $ap_nonprofit_corp = $$input({ type: 'checkbox' }).prop('checked', period.nonprofit_corp).appendTo($td);
            $$td({ html: 'Nonprofit Corporation' }).appendTo($tr);
        }
    };

    function summary($dtlsec_hdr) {
        var $dtlsec = $('#summary');
        if ($dtlsec.length == 0) $dtlsec = $$div({ id: 'summary', class: 'dtlsec' }).insertAfter($dtlsec_hdr);
        $dtlsec.empty();

        var $fieldSet = $$fieldsetAndlegend('General Information').appendTo($dtlsec);
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Legal Name: ', style: 'text-align: right;' }).appendTo($tr);
        var $td = $$td({ html: data.tp.legal_name, colspan: 5 }).appendTo($tr);

        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Virginia Id: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ htmL: data.tp.virginia_id }).appendTo($tr);
        $$td({ html: 'FEIN: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: data.tp.FEIN }).appendTo($tr);
        $$td({ html: 'Compliance Code: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: data.tp.compliance_code }).appendTo($tr);

        var paddr = data.tp.physical_address;
        var $fieldSet = $$fieldsetAndlegend('Physical Address').appendTo($dtlsec);
        $fieldSet.css({ display: 'inline-block', width: '49.7%' });
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Street: ', style: 'text-align:right;vertical-align: top;' }).appendTo($tr);
        var $td = $$td({ html: paddr.street, colspan: 3 }).appendTo($tr);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'City: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: paddr.city, colspan: 3 }).appendTo($tr);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'State: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: paddr.state }).appendTo($tr);
        $$td({ html: 'Zip: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: paddr.zip }).appendTo($tr);

        var maddr = data.tp.mailing_address;
        var $fieldSet = $$fieldsetAndlegend('Mailing Address').appendTo($dtlsec);
        $fieldSet.css({ display: 'inline-block', width: '49.7%' });
        var $table = $$table().appendTo($fieldSet);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'Street: ', style: 'text-align:right;vertical-align: top;' }).appendTo($tr);
        var $td = $$td({ html: maddr.street, colspan: 3 }).appendTo($tr);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'City: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: maddr.city, colspan: 3 }).appendTo($tr);
        var $tr = $$tr().appendTo($table);
        $$td({ html: 'State: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: maddr.state }).appendTo($tr);
        $$td({ html: 'Zip: ', style: 'text-align:right;' }).appendTo($tr);
        var $td = $$td({ html: maddr.zip }).appendTo($tr);
    };

    return {
        render: render,
    };
})();

