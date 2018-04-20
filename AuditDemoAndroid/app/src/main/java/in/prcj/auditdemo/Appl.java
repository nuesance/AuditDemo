package in.prcj.auditdemo;

import android.app.*;
import android.content.*;

import java.io.*;

public class Appl extends Application {
    public Util util;
    public MainActivity main;
    public Db db;
    public File wwwDir;

    public void init() {
        try {
            if (util == null) util = new Util(this);
            if (db == null) db = new Db(this);
            wwwDir = getExternalFilesDir("www");
            wwwDir.mkdirs();
        } catch (Throwable ex) {
            Util.log(ex);
        }

    }

    public void destroy() {
        if (db != null) {
            db.close();
            db = null;
        }
        util = null;
        main = null;
    }

    public static Appl getAppl(Context context) {
        Appl appl = (Appl) context.getApplicationContext();
        appl.init();
        if (context instanceof MainActivity) {
            appl.main = (MainActivity) context;
        }
        return appl;
    }
}
