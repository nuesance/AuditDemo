package in.prcj.auditdemo.util;

import java.util.*;

public class Buff {
    private static final int NUMBER = 0;
    private static final int STRING = 1;
    private static final int BOOLEAN = 2;
    private static final char NULL = '~';

    private StringBuilder buffer;
    private String str;
    private int pos;

    private static final char[] b64 = new char[64];
    private static final int[] b64_pos = new int['z' + 1];
    private static final char[] b62 = new char[62];
    private static final int[] b62_pos = new int['z' + 1];

    static {
        String b64_str = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
        String b62_str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (int i = 0; i < b64_str.length(); i++) {
            char c = b64_str.charAt(i);
            b64[i] = c;
            b64_pos[c] = i;
        }

        for (int i = 0; i < b62_str.length(); i++) {
            char c = b62_str.charAt(i);
            b62[i] = c;
            b62_pos[c] = i;
        }
    }

    private Buff() {
        buffer = new StringBuilder();
    }

    private Buff(String buff) {
        str = buff;
        pos = 0;
    }

    private void writeObject(Object val) {
        if (val == null) {
            writeNull();
        } else if (val instanceof String) {
            writeStr((String) val);
        } else if (val instanceof Integer) {
            writeInt((Integer) val);
        } else if (val instanceof Long) {
            writeLong((Long) val);
        } else if (val instanceof Map) {
            Map<String, Object> fhMap = (Map<String, Object>) val;
            buffer.append("{");
            for (Map.Entry<String, Object> loEntry : fhMap.entrySet()) {
                writeStr(loEntry.getKey());
                writeObject(loEntry.getValue());
            }
            buffer.append("}");
        } else if (val instanceof List) {
            List lvDat = (List) val;
            buffer.append("[");
            for (Object loEntry : lvDat) {
                writeObject(loEntry);
            }
            buffer.append("]");
        } else if (val instanceof Object[]) {
            Object[] lvDat = (Object[]) val;
            buffer.append("[");
            for (Object loEntry : lvDat) {
                writeObject(loEntry);
            }
            buffer.append("]");
        } else if (val instanceof Boolean) {
            writeBool((Boolean) val);
        } else {
            throw new Error("Invalid object type " + val.getClass().getName());
        }
    }

    private void writeInt(int val) {
        writeInt(buffer, val);
    }

    private void writeLong(long val) {
        writeLong(buffer, val);
    }

    private void writeStr(String val) {
        writeStr(buffer, val);
    }

    private void writeBool(Boolean val) {
        writeBool(buffer, val);
    }

    private void writeNull() {
        writeNull(buffer);
    }

    private Object readElement() {
        char c = str.charAt(pos);
        if (c == NULL) {
            pos++;
            return null;
        } else if (c == '[') {
            pos++;
            ArrayList arr = new ArrayList();
            while (true) {
                c = str.charAt(pos);
                if (c == ']') {
                    pos++;
                    return arr;
                }
                arr.add(readElement());
            }
        } else if (c == '{') {
            pos++;
            HashMap<String, Object> obj = new HashMap<>();
            while (true) {
                c = str.charAt(pos);
                if (c == '}') {
                    pos++;
                    return obj;
                }
                String key = (String) readElement();
                Object val = readElement();
                if (val == null) continue;
                obj.put(key, val);
            }
        }

        Object[] dat = readCtrl();
        int typ = (int) dat[0];
        int len = (int) dat[1];
        if (typ == NUMBER) {
            String val = str.substring(pos, len + pos);
            pos += len;
            try {
                return Integer.parseInt(val);
            } catch (Exception ex) {
                return Long.parseLong(val);
            }
        } else if (typ == STRING) {
            String val = str.substring(pos, len + pos);
            pos += len;
            return val;
        } else if (typ == BOOLEAN) {
            return len == 1;
        } else {
            throw new Error("Invalid type " + typ);
        }
    }

    public String toString() {
        return buffer.toString();
    }

    private static void writeInt(StringBuilder buffer, int val) {
        String str = val + "";
        int len = str.length();
        buffer.append(bldCtrl(NUMBER, len));
        buffer.append(str);
    }

    public static void writeInt(StringBuilder buffer, Integer val) {
        if (val == null) {
            writeNull(buffer);
        } else {
            writeInt(buffer, (int) val);
        }
    }

    private static void writeLong(StringBuilder buffer, long val) {
        String str = val + "";
        int len = str.length();
        buffer.append(bldCtrl(NUMBER, len));
        buffer.append(str);
    }

    public static void writeLong(StringBuilder buffer, Long val) {
        if (val == null) {
            writeNull(buffer);
        } else {
            writeLong(buffer, (long) val);
        }
    }

    private static void writeStr(StringBuilder buffer, String val) {
        if (val == null) {
            writeNull(buffer);
        } else {
            buffer.append(bldCtrl(STRING, val.length()));
            buffer.append(val);
        }
    }

    private static void writeBool(StringBuilder buffer, Boolean val) {
        if (val == null) {
            writeNull(buffer);
        } else {
            buffer.append(bldCtrl(BOOLEAN, val ? 1 : 0));
        }
    }

    private static void writeNull(StringBuilder buffer) {
        buffer.append(NULL);
    }

    private Object[] readCtrl() {
        char c = str.charAt(pos);
        pos++;
        int i = b64_pos[c];
        int typ = i >> 3;
        int len = i & 7;
        if (len < 7) {
            return new Object[]{typ, len};
        }

        len = 0;
        int shift = 0;
        while (true) {
            c = str.charAt(pos);
            pos++;
            i = b64_pos[c];
            if (i <= 31) {
                len = len | (i << shift);
                shift += 5;
            } else {
                len = len | ((i & 31) << shift);
                return new Object[]{typ, len};
            }
        }
    }

    private static String bldCtrl(int typ, int len) {
        if (typ > 7) {
            throw new Error("Type must be les than 7");
        }

        if (len < 7) {
            int i = (typ << 3) | len;
            return String.valueOf(b64[i]);
        }

        int i = (typ << 3) | 7;
        String str = String.valueOf(b64[i]);

        while (true) {
            if (len > 31) {
                i = len & 31;
                len = len >> 5;
                str += String.valueOf(b64[i]);
            } else {
                len = len | 32;
                str += String.valueOf(b64[len]);
                return str;
            }
        }
    }

    public static String numToStr(long num) {
        String str = "";
        while (true) {
            int i = (int) (num % 62);
            num = (long) Math.floor(num / 62);
            str = b62[i] + str;
            if (num == 0) break;
        }
        return str;
    }

    public static long strToNum(String str) {
        long num = 0;
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            int val = b62_pos[c];
            num = num * 62;
            num = num + val;
        }
        return num;
    }

    public static Object parse(String str) {
        Buff buff = new Buff(str);
        return buff.readElement();
    }

    public static String stringify(Object val) {
        Buff buff = new Buff();
        buff.writeObject(val);
        return buff.toString();
    }
}

