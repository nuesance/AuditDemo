package com.demo;

import java.io.*;
import java.text.*;
import java.util.*;

public class Util {
    public static SimpleDateFormat mTimeStampFormat = new SimpleDateFormat("ddMMMHHmmss");
    public static SimpleDateFormat mDateTimeFormat = new SimpleDateFormat("dd-MMM-yy HH:mm:ss");


    public static void log(Throwable ex) {
        log(exceptionToString(ex));
    }

    public static void log(String msg) {
        System.out.println(msg);
    }

    public static String getTimeStamp() {
        return mTimeStampFormat.format(new Date());
    }

    public static String exceptionToString(Throwable ex) {
        Throwable loRootCause = getRootCause(ex);
        StackTraceElement[] laTrace = loRootCause.getStackTrace();
        String lsData = loRootCause.toString() + "\r\n";
        String lsMessage = ex.getMessage();
        if (lsMessage != null) lsData += lsMessage + "\r\n\r\n";
        for (StackTraceElement loTrace : laTrace) {
            lsData += "\tat " + loTrace + "\r\n";
        }
        return lsData;
    }

    public static Throwable getRootCause(Throwable ex) {
        Throwable loThrowable = ex;
        while (loThrowable instanceof Error && loThrowable.getCause() != null) {
            loThrowable = loThrowable.getCause();
        }
        return loThrowable;
    }

    public static byte[] readFile(String file) {
        try {
            return readStream(new FileInputStream(file));
        } catch (Exception ex) {
            throw new Error(ex.getMessage(), ex);
        }
    }

    public static byte[] readStream(InputStream is) {
        try {
            byte[] laBuffer = new byte[1024 * 1024];
            ByteArrayOutputStream loByteArrayOutputStream = new ByteArrayOutputStream();
            while (true) {
                int liSize = is.read(laBuffer);
                if (liSize <= 0) break;
                loByteArrayOutputStream.write(laBuffer, 0, liSize);
            }
            is.close();
            return loByteArrayOutputStream.toByteArray();
        } catch (Exception ex) {
            throw new Error(ex.getMessage(), ex);
        }
    }

    public static String[] getKeys(HashMap map) {
        Set<String> keySet = map.keySet();
        String[] keys = keySet.toArray(new String[keySet.size()]);
        Arrays.sort(keys);
        return keys;
    }

    public static String fileSizeStr(long size) {
        if (size < 1024) {
            return size + " Bytes";
        }
        size = size / 1024;
        if (size < 1024) {
            return (Math.round(size * 100) / 100) + " KB";
        }
        size = size / 1024;
        return (Math.round(size * 100) / 100) + " MB";
    }

    public static HashMap<String, Object> getMap(HashMap<String, Object> entry, String key) {
        return (HashMap) entry.get(key);
    }

    public static String getStr(HashMap<String, Object> entry, String key) {
        return (String) entry.get(key);
    }

    public static int getInt(HashMap<String, Object> entry, String key) {
        Object obj = entry.get(key);
        if (obj == null) return 0;
        else if (obj instanceof Long) {
            return (int) ((long) obj);
        } else if (obj instanceof Integer) {
            return (int) obj;
        } else {
            Util.log("Util.getInt Invalid type " + obj.getClass());
            return -1;
        }
    }

    public static boolean getBool(HashMap<String, Object> entry, String key) {
        Boolean val = (Boolean) entry.get(key);
        return val == null ? false : val;
    }
}