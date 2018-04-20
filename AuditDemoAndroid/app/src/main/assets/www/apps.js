"use strict";

var apps = (function () {
    function start() {
        var opts = {
            title: 'Apps',
            menu: [
                { icon: 'mi_launch', title: 'Create Shortcut', func: function () { util.createShortcut('apps', 'Apps', 'mi_apps'); } },
            ],
        };
        ui.header.render(opts);

        var items = [
            {
                icon: 'my_drive_sync', title: 'Drive Sync', backFunc: start, func: function () {
                    driveSync.start();
                }
            },
            {
                icon: 'gl_reduce', title: 'Compress Photos', backFunc: start, func: function () {
                    callBack.checkPermission('WRITE_EXTERNAL_STORAGE')
                        .then(function (rslt) {
                            if (rslt.rc == 0) photoCompress.start();
                        });
                }
            },
            {
                icon: 'my_contact_grid', title: 'Contacts Grid', backFunc: start, func: function () {
                    callBack.checkPermission('READ_CONTACTS')
                        .then(function (rslt) {
                            if (rslt.rc == 0) contact.start();
                        });
                }
            },
            {
                icon: 'mi_collections', title: 'Gallery', backFunc: start, func: function () {
                    callBack.checkPermission('READ_EXTERNAL_STORAGE')
                        .then(function (rslt) {
                            if (rslt.rc == 0) {
                                gallery.content.start();
                            }
                        });
                }
            },
            {
                icon: 'mi_folder_shared', title: 'Photo Explorer', backFunc: start, func: function () {
                    callBack.checkPermission('READ_EXTERNAL_STORAGE')
                        .then(function (rslt) {
                            if (rslt.rc == 0) {
                                gallery.explorer.start();
                            }
                        });
                }
            },
            { icon: 'mi_settings_system_daydream', title: 'Google Explorer', backFunc: start, func: googleDriveExplorer.start },
            {
                icon: 'mi_layers_clear', title: '.nomedia', func:
                    function () {
                        callBack.checkPermission('WRITE_EXTERNAL_STORAGE')
                            .then(function (rslt) {
                                if (rslt.rc == 0) nomedia.start();
                            });
                    }
            },
        ];
        renderIcons(items);
    };

    function renderIcons(items) {
        var $dataDiv = ui.getEmptyDataDiv();

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var $entryDiv = $$div({ 'data-i': i, class: 'app_outer_div' }).appendTo($dataDiv);
            var $div = $$div({ class: 'app_icon' }).appendTo($entryDiv);
            var icon = item.icon;
            if (icon.indexOf('svg/') == 0) {
                icon = icon + color.appFill;
            }
            else {
                icon = 'img/app/' + icon + '.svg';
            }
            $$img({ src: icon, style: 'width: 4rem; height: 4rem;' }).appendTo($div);
            $$div({ html: item.title, class: 'thumb_txt' }).appendTo($entryDiv);
        }
        $dataDiv.on('click', '.app_outer_div', function () {
            var $div = $(this);
            var i = $div.attr('data-i');
            i = Number(i);
            var item = items[i];
            if (item.backFunc) onBack.add(item.backFunc);
            item.func();
        });
    }

    return {
        start: start, renderIcons: renderIcons,
    };
})();

var photoCompress = (function () {
    var size_options = { A: 'Large', B: 'Medium', C: 'Small' }
    var quality_options = { A: 'Very Good', B: 'Good', C: 'Average' };

    function start() {
        var opts = {
            title: 'Photo Compress',
            menu: [
                { icon: 'mi_launch', title: 'Create Shortcut', func: function () { util.createShortcut('photo_compress', 'Photo Compress', 'gl_reduce'); } },
                {
                    icon: 'mi_delete_forever', title: 'Clear History', func: function () { db.photo_compress_h.delAll(); }
                },
                { title: 'View History', func: viewHistory },
            ],
        };
        ui.header.render(opts);

        var $dataDiv = ui.getEmptyDataDiv();
        ui.createAddButton(function () { editEntry(null); });

        var allData = db.photo_compress_q.getAll();
        var ids = Object.keys(allData);
        ids.sort();
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            renderEntry(id);
        }
    };

    function editEntry(id) {
        var editMode = (id != null);
        var entryData = {};
        if (editMode) entryData = db.photo_compress_q.get(id);

        var formOpts = {
            title: 'Change Options',
            fields: {
                src_folder: { typ: 'folder', label: 'Source Folder', required: true, val: entryData.src_folder },
                src_dest_same: { typ: 'checkbox', label: 'Destination Same As Source (Overwrite)', val: entryData.dest_folder == null },
                dest_folder: { typ: 'folder', label: 'Destination Folder', val: entryData.dest_folder },
                size: { typ: 'select', label: 'Output Size', val: entryData.size, options: size_options },
                quality: { typ: 'select', label: 'Quality', val: entryData.quality, options: quality_options },
            }
        };

        var form = ui.form.create(formOpts);

        form.onValidate = function (valuMap) {
            if (!valuMap.src_folder) {
                ui.showError('Please Select Source Folder');
                return false;
            }
            if (!valuMap.src_dest_same && !valuMap.dest_folder) {
                ui.showError('Please Select Destination Folder');
                return false;
            }
            return true;
        };


        form.onSubmit = function (valuMap) {
            if (valuMap.src_dest_same) {
                delete valuMap.dest_folder;
            }
            delete valuMap.src_dest_same;
            if (!editMode) id = db.createKey();
            valuMap.pause = true;
            db.photo_compress_q.put(id, valuMap);
            renderEntry(id);
        };
    };

    function renderEntry(id) {
        var $dataDiv = ui.getDataDiv();
        var entryData = db.photo_compress_q.get(id);
        var $entryDiv = $('#entry_' + id);
        if ($entryDiv.length == 0) {
            $entryDiv = $$div({ id: 'entry_' + id, class: 'card_1' }).appendTo($dataDiv);
        }
        $entryDiv.empty();

        $$img({
            src: 'svg/mi_edit' + color.mnuFill, style: 'float :right; width: 1.5rem; height: 1.5rem;', click: function () {
                editEntry(id);
            }
        }).appendTo($entryDiv);
        $$img({
            src: 'svg/mi_delete' + color.mnuFill, style: 'float :right; width: 1.5rem; height: 1.5rem;', click: function () {
                var opts = { title: 'Delete Entry', message: 'Delete compress queue entry' };
                opts.onConfirm = function () {
                    db.photo_compress_q.del(id);
                    $('#entry_' + id).remove();
                };
                ui.confirm(opts);
            }
        }).appendTo($entryDiv);

        $$img({
            src: 'svg/' + (entryData.pause ? 'mi_play_arrow' : 'mi_pause') + color.mnuFill,
            style: 'float :right; width: 1.5rem; height: 1.5rem;', click: function () {
                if (entryData.pause) delete entryData.pause;
                else entryData.pause = true;
                db.photo_compress_q.put(id, entryData);
                var rslt = Native_Main.messageToService(STRAT_COMPRESS);
                var rslt = util.buff.parse(rslt);
                util.checkError(rslt);
                if (rslt.rc != 0) return;
                renderEntry(id);
            }
        }).appendTo($entryDiv);

        $$div({ html: '<b>Source Folder:</b>' }).appendTo($entryDiv);
        if (entryData.src_folder) {
            $$div({ html: util.storageNameDisplay(entryData.src_folder), style: 'max-width: 100%; word-wrap: break-word;' }).appendTo($entryDiv);
        } else {
            $$div({ html: 'Not Selected' }).appendTo($entryDiv);
        }
        if (entryData.dest_folder) {
            $$div({ html: '<b>Destination Folder:</b>' }).appendTo($entryDiv);
            $$div({ html: util.storageNameDisplay(entryData.dest_folder), style: 'max-width: 100%; word-wrap: break-word;' }).appendTo($entryDiv);
        } else {
            $$div({ html: '<b>Destination Same As Source (Overwrite)</b>' }).appendTo($entryDiv);
        }
        entryData.size = entryData.size || 'B';
        entryData.quality = entryData.quality || 'B';
        $$div({ html: '<b>Output Size: </b>' + size_options[entryData.size] + '&nbsp;&nbsp;<b>Quality: </b>' + quality_options[entryData.quality] }).appendTo($entryDiv);
    };

    function viewHistory() {
        ui.header.render({ title: 'Photo Compress - History' });
        onBack.add(start);
        var $dataDiv = ui.getEmptyDataDiv();

        var rslt = db.retrieve('Select id, data From photo_compress_q Order By id');
        if (rslt.rc != 0) return;
        var rows = rslt.data;
        if (rows.length == 0) {
            ui.toast('No compression history present.');
            return;
        }

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var qid = row[0];
            var data = row[1];
            if (data) data = util.buff.parse(data);

            var txt = util.storageNameDisplay(data.src_folder);
            if (data.dest_folder) txt += ' => ' + util.storageNameDisplay(data.dest_folder);
            var $div = $$div({ style: 'margin: 2px; padding:5px; background-color: lightgray; border: 1px solid gray;' }).appendTo($dataDiv);
            $div.html(txt);

            var rslt = db.retrieve('Select id, data From photo_compress_h Where qid = ? Order By id', qid);
            if (rslt.rc != 0) return;
            var hrows = rslt.data;
            for (var j = 0; j < hrows.length; j++) {
                var hrow = hrows[j];
                var hid = hrow[0];
                var hdata = hrow[1];
                hdata = util.buff.parse(hdata);
                var fileName = hid.substr(qid.length + 1);

                var $entryDiv = $$div({ style: 'margin: 2px; border-bottom: 1px solid lightgray;' }).appendTo($dataDiv);
                $$span({ html: fileName }).appendTo($entryDiv);
                var txt = 'File Size ' + util.fileSizeStr(hdata.in_size);
                if (hdata.out_size) txt += ' to ' + util.fileSizeStr(hdata.out_size);
                $$span({ html: '&nbsp;' + txt }).appendTo($entryDiv);
                txt = 'Dimension ' + hdata.in_width + 'x' + hdata.in_height;
                if (hdata.out_width) txt += ' to ' + hdata.out_width + 'x' + hdata.out_height;
                if (hdata.no_change) txt += ' no change';
                $$div({ html: '&nbsp;&nbsp;&nbsp;' + txt }).appendTo($entryDiv);
            }
        }
    };

    return { start: start, };
})();

var googleDriveExplorer = (function () {
    function start(opts) {
        var $dataDiv = ui.getEmptyDataDiv();
        var hdrOpts = {
            title: 'Google Explorer',
            menu: [
                {
                    icon: 'mi_delete_forever', title: 'Clear Cache', func: function () {
                        var opts = { title: 'Clear Cache', message: 'Delete all rows from my_gd tables' };
                        opts.onConfirm = function () {
                            db.ctrl.del('changesToken');
                            var tables = db.getMetadata();
                            for (var tableName in tables) {
                                if (tableName.indexOf('my_gd_') == 0) {
                                    db.table(tableName).delAll();
                                }
                            }
                        };
                        ui.confirm(opts);
                    }
                },
            ],
        };
        ui.header.render(hdrOpts);

        var rslt = Native_Main.getSignInAccount();
        var rslt = util.buff.parse(rslt);
        util.checkError(rslt);
        if (rslt.rc != 0 || !rslt.data) {
            ui.showError('Please sign in to google');
            return;
        }

        var rslt = Native_Main.messageToService(REFRESH_MY_GD);
        var rslt = util.buff.parse(rslt);
        util.checkError(rslt);
        if (rslt.rc != 0) return;

        var str = Native_Main.getDriveTree();
        var rslt = util.buff.parse(str);
        util.checkError(rslt);
        if (rslt.rc != 0) return;

        function getChildren(folder) {
            var items = folder.children || [];

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                item.showThumb = true;
                if (!item.thumbnailVersion) item.thumbUrl = 'https://drive-thirdparty.googleusercontent.com/64/type/' + item.mimeType;
                //item.path = 'file:///gd_items/' + item.id;
            }
            return items;
        };

        var items = getChildren(rslt.data);
        var gridOpts = {
            getChildren: function (item) {
                return getChildren(item);
            },

            getThumbFile: function (item) {
                return item.id + '_' + item.thumbnailVersion + '.jpg';
            },

            createThumbnails: function (items) {
                var ids = [];
                for (var i = 0; i < items.length; i++) {
                    ids.push(items[i].id);
                }
                Native_Main.createGDThumbnails(ids);
            }
        }

        if (opts && opts.selectFolder) {
            gridOpts.onSelect = opts.onSelect;
            gridOpts.selectFolder = opts.selectFolder;
            gridOpts.folder = { id: 'root', name: 'Root' };
        }

        grid.start(items, gridOpts);
    }

    return { start: start, };
})();

var nomedia = (function () {
    function start() {
        callBack.selectFolder()
            .then(function (rslt) {
                util.checkError(rslt);
                if (rslt.rc != 0) return;
                if (rslt.data) {
                    processFolder(rslt.data);
                }
            });
    };

    function processFolder(folder) {
        var displayName = util.storageNameDisplay(folder);
        var path = folder + '/.nomedia';
        var rslt = Native_Main.fileExists(path);
        var rslt = util.buff.parse(rslt);
        util.checkError(rslt);
        if (rslt.rc != 0) return;
        var exists = rslt.data;

        var opts = { title: exists ? 'Remove .nomedia' : 'Add .nomedia', message: 'Folder: ' + displayName };
        opts.onConfirm = function () {
            if (exists) {
                var rslt = Native_Main.removeFile(path);
                rslt = util.buff.parse(rslt);
                util.checkError(rslt);
            }
            else {
                var rslt = Native_Main.createEmptyFile(path);
                rslt = util.buff.parse(rslt);
                util.checkError(rslt);
            }
            var rslt = Native_Main.scanMedia(path);
            rslt = util.buff.parse(rslt);
            util.checkError(rslt);
        };
        ui.confirm(opts);
    };

    return {
        start: start,
    };
})();
