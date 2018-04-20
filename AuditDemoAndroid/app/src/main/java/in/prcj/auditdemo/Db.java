package in.prcj.auditdemo;

import android.content.*;
import android.database.*;
import android.database.sqlite.*;
import android.webkit.*;

import java.util.*;

import in.prcj.auditdemo.util.*;

public class Db extends SQLiteOpenHelper {
    public Appl appl;

    public tbl ctrl;
    public tbl audit_case;
    public js js;

    public Db(Context context) {
        super(context, "db", null, 1);
        appl = (Appl) context.getApplicationContext();

        ctrl = new tbl("ctrl");
        audit_case = new tbl("audit_case");
        js = new js();
    }

    public void onCreate(SQLiteDatabase foDatabase) {
    }

    public void onUpgrade(SQLiteDatabase foDatabase, int fiOldVersion, int fiNewVersion) {
    }

    public String createKey() {
        long ts = new Date().getTime();
        return Buff.numToStr(ts);
    }

    public void createTable(String tname) {
        String sql = "Create Table If Not Exists " + tname + " (id text Not Null, data text Not Null, Constraint " + tname + "_pk Primary Key (id))";
        Db.this.execute(sql, new Object[0]);
    }

    public void createTable(String tname, String[] extraCols) {
        String sql = "Create Table If Not Exists " + tname + " (id text Not Null, data text Not Null,";
        for (int i = 0; i < extraCols.length; i++) {
            sql += " " + extraCols[i] + " text,";
        }
        sql += " Constraint " + tname + "_pk Primary Key (id))";
        Db.this.execute(sql, new Object[0]);
    }

    public void dropTable(String tname) {
        String sql = "Drop Table If Exists " + tname;
        Db.this.execute(sql, new Object[0]);
    }

    public boolean isEmpty(String tname) {
        SQLiteDatabase db = getWritableDatabase();
        Cursor cursor = db.rawQuery("Select id From " + tname, new String[0]);
        boolean exists = cursor.moveToFirst();
        cursor.close();
        return !exists;
    }

    public boolean exists(String tname, String id) {
        SQLiteDatabase db = getWritableDatabase();
        Cursor cursor = db.rawQuery("Select id From " + tname + " Where id = ?", new String[]{id});
        boolean exists = cursor.moveToFirst();
        cursor.close();
        return exists;
    }

    public String getAsStr(String tname, String id) {
        SQLiteDatabase db = getWritableDatabase();
        Cursor cursor = db.rawQuery("Select data From " + tname + " Where id = ?", new String[]{id});
        String val = null;
        if (cursor.moveToFirst()) {
            val = cursor.getString(0);
        }
        cursor.close();
        return val;
    }

    public Object get(String tname, String id) {
        String val = getAsStr(tname, id);
        return val == null ? null : Buff.parse(val);
    }

    public HashMap<String, Object> getAsMap(String tname, String id) {
        String val = getAsStr(tname, id);
        return val == null ? null : (HashMap<String, Object>) Buff.parse(val);
    }

    public HashMap<String, Object> getAll(String tname) {
        HashMap<String, Object> map = new HashMap<>();
        SQLiteDatabase db = getWritableDatabase();
        Cursor cursor = db.rawQuery("Select id, data From " + tname, new String[0]);

        if (!cursor.moveToFirst()) {
            cursor.close();
            return map;
        }

        do {
            String id = cursor.getString(0);
            String data = cursor.getString(1);
            map.put(id, Buff.parse(data));

        } while (cursor.moveToNext());
        cursor.close();

        return map;
    }

    public HashMap<String, HashMap<String, Object>> getAllAsMap(String tname) {
        HashMap<String, HashMap<String, Object>> map = new HashMap<>();
        SQLiteDatabase db = getWritableDatabase();
        Cursor cursor = db.rawQuery("Select id, data From " + tname, new String[0]);

        if (!cursor.moveToFirst()) {
            cursor.close();
            return map;
        }

        do {
            String id = cursor.getString(0);
            String data = cursor.getString(1);
            map.put(id, (HashMap<String, Object>) Buff.parse(data));

        } while (cursor.moveToNext());
        cursor.close();

        return map;
    }

    public void add(String tname, String id, HashMap<String, Object> data) {
        String dat = Buff.stringify(data);
        execute("Insert Into " + tname + " Values (?, ?)", new String[]{id, dat});
    }

    public void set(String tname, String id, HashMap<String, Object> data) {
        String dat = Buff.stringify(data);
        execute("Update  " + tname + " Set data = ? Where id = ?", new String[]{dat, id});
    }

    public void put(String tname, String id, Object data) {
        String dat = Buff.stringify(data);
        boolean exists = exists(tname, id);
        if (exists) {
            execute("Update  " + tname + " Set data = ? Where id = ?", new String[]{dat, id});
        } else {
            execute("Insert Into " + tname + " Values (?, ?)", new String[]{id, dat});
        }
    }

    public void del(String tname, String id) {
        execute("Delete From  " + tname + " Where id = ?", new String[]{id});
    }

    public void delAll(String tname) {
        execute("Delete From  " + tname, new String[0]);
    }

    public void execute(String sql, Object[] args) {
        SQLiteDatabase db = getWritableDatabase();
        db.execSQL(sql, args);
    }

    public Object[][] retrieve(String sql) {
        return retrieve(sql, new String[0]);
    }

    public Object[][] retrieve(String sql, String[] params) {
        SQLiteDatabase db = getWritableDatabase();
        Cursor loCursor = db.rawQuery(sql, params);
        if (!loCursor.moveToFirst()) return new Object[0][];
        int liRows = loCursor.getCount();
        Object[][] rows = new Object[liRows][];
        int liCols = loCursor.getColumnCount();
        for (int i = 0; i < liRows; i++) {
            Object[] row = new Object[liCols];
            rows[i] = row;
            for (int j = 0; j < liCols; j++) {
                int typ = loCursor.getType(j);
                if (typ == Cursor.FIELD_TYPE_NULL) {
                } else if (typ == Cursor.FIELD_TYPE_INTEGER) {
                    if (loCursor.getInt(j) >= 0)
                        row[j] = loCursor.getInt(j);
                    else
                        row[j] = loCursor.getLong(j);
                } else if (typ == Cursor.FIELD_TYPE_STRING) {
                    row[j] = loCursor.getString(j);
                } else {
                    throw new Error("Invalid type " + typ);
                }
            }
            loCursor.moveToNext();
        }
        loCursor.close();
        return rows;
    }

    public static ArrayList<Object[]> readCursor(Cursor cursor) {
        ArrayList<Object[]> rows = new ArrayList<>();
        if (!cursor.moveToFirst()) {
            cursor.close();
            return rows;
        }
        int rowCount = cursor.getCount();
        int colCount = cursor.getColumnCount();
        for (int i = 0; i < rowCount; i++) {
            Object[] row = new Object[colCount];
            rows.add(row);
            for (int j = 0; j < colCount; j++) {
                int typ = cursor.getType(j);
                if (typ == Cursor.FIELD_TYPE_NULL) {
                } else if (typ == Cursor.FIELD_TYPE_INTEGER) {
                    if (cursor.getInt(j) >= 0)
                        row[j] = cursor.getInt(j);
                    else
                        row[j] = cursor.getLong(j);
                } else if (typ == Cursor.FIELD_TYPE_STRING) {
                    row[j] = cursor.getString(j);
                } else {
                    throw new Error("Invalid type " + typ);
                }
            }
            cursor.moveToNext();
        }
        cursor.close();
        return rows;
    }

    public void close() {
        try {
            getWritableDatabase().close();
        } catch (Exception ex) {

        }
    }

    public static Object[] parseArray(String param) {
        Object[] args = new Object[0];
        if (!param.equals("")) {
            ArrayList params = (ArrayList) Buff.parse(param);
            args = params.toArray(new Object[params.size()]);
        }
        return args;
    }

    public tbl getTbl(String tname) {
        return new tbl(tname);
    }

    public class tbl {
        public String tname;
        public String[] extraCols;

        public tbl(String tname) {
            Db.this.createTable(tname);
            this.tname = tname;
        }

        public tbl(String tname, String[] extraCols) {
            Db.this.createTable(tname, extraCols);
            this.tname = tname;
            this.extraCols = extraCols;
        }

        public boolean isEmpty() {
            return Db.this.isEmpty(tname);
        }

        public boolean exists(String id) {
            return Db.this.exists(tname, id);
        }

        public Object get(String id) {
            return Db.this.get(tname, id);
        }

        public HashMap<String, Object> getAsMap(String id) {
            return Db.this.getAsMap(tname, id);
        }

        public HashMap<String, Object> getAll() {
            return Db.this.getAll(tname);
        }

        public HashMap<String, HashMap<String, Object>> getAllAsMap() {
            return Db.this.getAllAsMap(tname);
        }

        public void add(String id, HashMap<String, Object> data) {
            Db.this.add(tname, id, data);
        }

        public void set(String id, HashMap<String, Object> data) {
            Db.this.set(tname, id, data);
        }

        public void put(String id, HashMap<String, Object> data) {
            Db.this.put(tname, id, data);
        }

        public void put(String id, ArrayList<String> data) {
            Db.this.put(tname, id, data);
        }

        public void del(String id) {
            Db.this.del(tname, id);
        }

        public void delAll() {
            Db.this.delAll(tname);
        }
    }

    public class js {
        @JavascriptInterface
        public String tableList() {
            HashMap<String, Object> map = new HashMap<>();
            map.put("ctrl", "Control");
            map.put("audit_case", "Folder");
            map.put("q_compress", "Compress Queue");
            return Buff.stringify(map);
        }

        @JavascriptInterface
        public void createTable(String tname) {
            Db.this.createTable(tname);
        }

        @JavascriptInterface
        public void dropTable(String tname) {
            Db.this.dropTable(tname);
        }

        @JavascriptInterface
        public boolean exists(String tname, String id) {
            return Db.this.exists(tname, id);
        }

        @JavascriptInterface
        public String get(String tname, String id) {
            return Db.this.getAsStr(tname, id);
        }

        @JavascriptInterface
        public String getAll(String tname) {
            return Buff.stringify(Db.this.getAll(tname));
        }

        @JavascriptInterface
        public void add(String tname, String id, String data) {
            Db.this.add(tname, id, (HashMap<String, Object>) Buff.parse(data));
        }

        @JavascriptInterface
        public void set(String tname, String id, String data) {
            Db.this.set(tname, id, (HashMap<String, Object>) Buff.parse(data));
        }

        @JavascriptInterface
        public void put(String tname, String id, String data) {
            Db.this.put(tname, id, Buff.parse(data));
        }

        @JavascriptInterface
        public void del(String tname, String id) {
            Db.this.del(tname, id);
        }

        @JavascriptInterface
        public void delAll(String tname) {
            Db.this.delAll(tname);
        }

        @JavascriptInterface
        public String execute(String sql, String param) {
            try {
                Object[] args = parseArray(param);
                SQLiteDatabase db = getWritableDatabase();
                db.execSQL(sql, args);
                return Rslt.ok();
            } catch (Throwable ex) {
                return Rslt.ex(ex);
            }
        }

        @JavascriptInterface
        public String retrieve(String sql, String param) {
            try {
                Object[] args = parseArray(param);
                String[] params = new String[args.length];
                for (int i = 0; i < args.length; i++) {
                    params[i] = (String) args[i];
                }
                SQLiteDatabase db = getWritableDatabase();
                Cursor cursor = db.rawQuery(sql, params);
                ArrayList<Object[]> rows = readCursor(cursor);
                return Rslt.ok(rows);
            } catch (Throwable ex) {
                return Rslt.ex(ex);
            }
        }
    }

}
