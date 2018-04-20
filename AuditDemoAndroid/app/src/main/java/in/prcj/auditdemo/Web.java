package in.prcj.auditdemo;

import android.content.*;
import android.net.*;
import android.view.*;
import android.webkit.*;

import java.io.*;
import java.net.*;
import java.util.*;

public class Web {
    public static class View extends WebView {
        public View(Context context) {
            super(context);
            setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        }

        public void doSetting() {
            WebSettings webSettings = getSettings();
            webSettings.setMediaPlaybackRequiresUserGesture(false);
            webSettings.setJavaScriptEnabled(true);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
            webSettings.setBuiltInZoomControls(true);

            webSettings.setLoadWithOverviewMode(true);
            webSettings.setUseWideViewPort(true);
            webSettings.setDomStorageEnabled(true);

            try {
                WebView.setWebContentsDebuggingEnabled(true);
            } catch (Throwable ex) {
                Util.log(ex.getMessage());
            }

            Util.log("User Agent: " + webSettings.getUserAgentString());
        }
    }

    public static class ChromeClient extends WebChromeClient {
        public MainActivity main;

        public ChromeClient(MainActivity main) {
            this.main = main;
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            if (consoleMessage.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                String lsFileName = consoleMessage.sourceId();
                if (lsFileName != null && lsFileName.contains("/www/js/"))
                    lsFileName = new File(lsFileName).getName();
                String msg = consoleMessage.message() + "<br><br>File: " + lsFileName + "<br>Line: " + consoleMessage.lineNumber();
                msg = msg.replace("'", "\"");
                Util.log(msg);
                main.showError(msg);
                return true;
            }
            return super.onConsoleMessage(consoleMessage);
        }
    }

    public static class ViewClient extends WebViewClient {
        public Appl appl;
        public MainActivity main;

        public ViewClient(Context context) {
            appl = Appl.getAppl(context);
            main = appl.main;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            try {
                url = URLDecoder.decode(url, "UTF-8");
                if (url.startsWith("file:///android_asset/prj/")) {
                    String fileName = url.substring(26);
                    return getAssets(fileName);
                } else if (url.startsWith("file:///android_asset/svg/")) {
                    String fileName = url.substring(26);
                    return getSVG(fileName);
                }
                return super.shouldInterceptRequest(view, request);
            } catch (Throwable e) {
                Util.log(e);
                main.showError(e.getMessage());
                return super.shouldInterceptRequest(view, request);
            }
        }

        public WebResourceResponse getAssets(String fileName) throws Exception {
            InputStream is;
            File file = new File(appl.wwwDir + "/" + fileName);
            if (file.exists() && file.lastModified() > BuildConfig.TIMESTAMP) {
                is = new FileInputStream(file);
            } else {
                is = main.getAssets().open("www/" + fileName);
            }
            String mimeType = "text/*";
            if (fileName.endsWith(".js")) {
                mimeType = "application/javascript";
            } else if (fileName.endsWith(".css")) {
                mimeType = "text/css";
            }

            return new WebResourceResponse(mimeType, "UTF-8", is);
        }

        public WebResourceResponse getSVG(String fileName) throws Exception {
            Uri uri = Uri.parse(fileName);
            String path = uri.getPath();
            HashMap<String, String> paramMap = getParams(fileName);
            String fill = paramMap.get("fill");

            InputStream is;
            File file = new File(appl.wwwDir + "/" + fileName);
            if (file.exists() && file.lastModified() > BuildConfig.TIMESTAMP) {
                is = new FileInputStream(file);
            } else {
                byte[] bytes = appl.util.readAsset("svg/" + path + ".svg");
                String data = new String(bytes);
                if (fill != null) {
                    data = data.replace("<path", "<path fill=\"" + fill + "\"");
                }
                is = new ByteArrayInputStream(data.getBytes());
            }
            String mimeType = "image/svg+xml";
            return new WebResourceResponse(mimeType, "UTF-8", is);
        }

        public HashMap<String, String> getParams(String url) {
            HashMap<String, String> paramMap = new HashMap<>();
            int pos = url.indexOf("?");
            if (pos != -1) {
                String param = url.substring(pos + 1);
                String params[] = param.split("&");
                for (String par : params) {
                    String parts[] = par.split("=");
                    paramMap.put(parts[0], parts[1]);
                }
            }
            return paramMap;
        }
    }
}
