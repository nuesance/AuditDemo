package in.prcj.auditdemo.util;

import java.util.*;

import in.prcj.auditdemo.*;

public class Rslt {
    public int rc;
    public String msg;
    public Object data;

    public Rslt() {
    }

    public Rslt(int rc, String msg, Object data) {
        this.rc = rc;
        this.msg = msg;
        this.data = data;
    }

    public String stringify() {
        HashMap<String, Object> map = new HashMap<>();
        map.put("rc", rc);
        if (msg != null) map.put("msg", msg);
        if (data != null) map.put("data", data);
        return Buff.stringify(map);
    }

    public static String ok() {
        HashMap<String, Object> map = new HashMap<>();
        map.put("rc", 0);
        return Buff.stringify(map);
    }

    public static String ok(Object data) {
        HashMap<String, Object> map = new HashMap<>();
        map.put("rc", 0);
        map.put("data", data);
        return Buff.stringify(map);
    }

    public static String ex(Throwable ex) {
        HashMap<String, Object> map = new HashMap<>();
        map.put("rc", -1);
        map.put("msg", Util.exceptionToString(ex));
        return Buff.stringify(map);
    }

    public static String err(String err) {
        HashMap<String, Object> map = new HashMap<>();
        map.put("rc", 1);
        map.put("msg", err);
        return Buff.stringify(map);
    }

    public static Rslt okRslt() {
        return new Rslt(0, null, null);
    }

    public static Rslt okRslt(Object data) {
        return new Rslt(0, null, data);
    }

    public static Rslt exRslt(Throwable ex) {
        return new Rslt(-1, Util.exceptionToString(ex), null);
    }

    public static Rslt errRslt(String err) {
        return new Rslt(-1, err, null);
    }
}
