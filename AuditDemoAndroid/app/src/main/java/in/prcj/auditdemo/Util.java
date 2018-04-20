package in.prcj.auditdemo;

import android.content.*;
import android.graphics.*;
import android.media.*;
import android.util.*;
import android.webkit.*;
import android.widget.*;

import java.io.*;
import java.text.*;
import java.util.*;

import in.prcj.auditdemo.util.*;

public class Util {
    public Appl appl;

    public static String TAG = "PhotoShare";

    public static SimpleDateFormat mTimeStampFormat = new SimpleDateFormat("ddMMMHHmmss");
    public static SimpleDateFormat mDateTimeFormat = new SimpleDateFormat("dd-MMM-yy HH:mm:ss");

    public Util(Context context) {
        appl = (Appl) context.getApplicationContext();
    }

    public static void toast(Context context, String msg) {
        log(msg);
        Toast.makeText(context, msg, Toast.LENGTH_LONG).show();
    }

    public static void log(Throwable ex) {
        log(exceptionToString(ex));
    }

    public static void log(String msg) {
        Log.e(TAG, msg);
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

    public static void runOnThread(Runnable runnable) {
        new Thread(runnable).start();
    }

    public static Rslt photoCompress(byte[] bytes, final String size, final String quality) {
        try {
            int siz = 0;
            if (size.equals("A")) {
                siz = 1080;
            } else if (size.equals("B")) {
                siz = 720;
            } else if (size.equals("C")) {
                siz = 480;
            }

            int qly = 0;
            if (quality.equals("A")) {
                qly = 80;
            } else if (quality.equals("B")) {
                qly = 70;
            } else if (quality.equals("C")) {
                qly = 60;
            }

            HashMap<String, Object> map = new HashMap<>();
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            map.put("in_width", options.outWidth);
            map.put("in_height", options.outHeight);
            map.put("in_size", bytes.length);
            int min = Math.min(options.outWidth, options.outHeight);
            options.inSampleSize = Util.calculateSampleSize(min, siz);
            if (options.inSampleSize <= 1) {
                map.put("no_change", true);
                return Rslt.okRslt(map);
            }
            options.inJustDecodeBounds = false;
            Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            map.put("out_width", bitmap.getWidth());
            map.put("out_height", bitmap.getHeight());
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, qly, os);
            os.close();
            bytes = os.toByteArray();
            map.put("out_bytes", bytes);
            map.put("out_size", bytes.length);
            return Rslt.okRslt(map);
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public static Rslt getImageSize(String fileName, String size) {
        try {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(fileName, options);
            int min = Math.min(options.outWidth, options.outHeight);
            int siz = 0;
            if (size.equals("A")) {
                siz = 1080;
            } else if (size.equals("B")) {
                siz = 720;
            } else if (size.equals("C")) {
                siz = 480;
            }
            int sampleSize = Util.calculateSampleSize(min, siz);

            return Rslt.okRslt(new Object[]{options.outWidth, options.outHeight, sampleSize});
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public static Rslt getThumbnail_1(String fileName) {
        long ts1 = System.currentTimeMillis();
        try {
            byte[] bytes = Util.readStream(new FileInputStream(fileName));
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            int size = Math.min(options.outWidth, options.outHeight);
            Bitmap bitmap = null;
            if (size >= 1080) {
                options.inSampleSize = calculateSampleSize(size, 320);
                options.inJustDecodeBounds = false;
                bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            } else {
                bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            }
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            Bitmap thumbnail = ThumbnailUtils.extractThumbnail(bitmap, 320, 320);
            thumbnail.compress(Bitmap.CompressFormat.JPEG, 70, os);
            long ts2 = System.currentTimeMillis();
            log("ThumbNail " + fileName + " Size: " + size + " SampleSize: " + options.inSampleSize + " Timetaken: " + (ts2 - ts1));
            return Rslt.okRslt(os.toByteArray());
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public static Rslt getThumbnail(String fileName) {
        long ts1 = System.currentTimeMillis();
        try {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(fileName, options);
            int size = Math.min(options.outWidth, options.outHeight);
            options.inSampleSize = calculateSampleSize(size, 270);
            options.inJustDecodeBounds = false;
            Bitmap bitmap = BitmapFactory.decodeFile(fileName, options);
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, 70, os);
            os.close();
            long ts2 = System.currentTimeMillis();
            log("ThumbNail " + fileName + " Samplesize: " + options.inSampleSize + " Timetaken: " + (ts2 - ts1));
            return Rslt.okRslt(os.toByteArray());
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public static int calculateSampleSize(int imageHeight, int height) {
        int sampleSize = 1;
        while (true) {
            imageHeight = imageHeight / 2;
            if (imageHeight <= height) break;
            sampleSize = sampleSize * 2;
        }
        return sampleSize;
    }


    public byte[] readAsset(String name) {
        try {
            InputStream is = appl.main.getAssets().open(name);
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            byte[] bytes = new byte[100 * 1024];
            while (true) {
                int size = is.read(bytes);
                if (size == -1) break;
                os.write(bytes, 0, size);
            }
            is.close();
            return os.toByteArray();
        } catch (Throwable e) {
            log(e);
            appl.main.showError(e.getMessage());
            return null;
        }
    }

    public static String[] getKeys(HashMap map) {
        Set<String> keySet = map.keySet();
        String[] keys = keySet.toArray(new String[keySet.size()]);
        Arrays.sort(keys);
        return keys;
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

    @JavascriptInterface
    public static String getLogcat() {
        try {
            String[] args = {"logcat", "-d", "-s", TAG};
            java.lang.Process process = Runtime.getRuntime().exec(args);
            BufferedReader loReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            ArrayList<String> lines = new ArrayList<>();
            while ((line = loReader.readLine()) != null) {
                String time = line.substring(6, 14);
                int pos = line.indexOf(TAG + ":");
                if (pos == -1) continue;
                pos += TAG.length() + 2;
                lines.add(time + " " + line.substring(pos));
            }
            loReader.close();

            ArrayList<String> resultLines = new ArrayList<>();
            int liStart = Math.max(0, lines.size() - 250);
            for (int liCtr = liStart; liCtr < lines.size(); liCtr++) {
                resultLines.add(lines.get(liCtr));
            }
            return Rslt.ok(resultLines);
        } catch (Throwable ex) {
            return Rslt.ex(ex);
        }
    }
}