package in.prcj.auditdemo;

import android.app.*;
import android.content.*;
import android.graphics.*;
import android.net.*;
import android.os.*;
import android.support.annotation.*;
import android.support.design.widget.*;
import android.view.*;
import android.webkit.*;
import android.widget.*;

import in.prcj.auditdemo.util.*;

public class MainActivity extends Activity {
    public Web.View mWebView;
    public Appl appl;
    public Messenger mServiceMessenger;
    public CoordinatorLayout contentView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        appl = Appl.getAppl(this);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);

        startup();
    }

    public void startup() {
        contentView = new CoordinatorLayout(this);
        contentView.setLayoutParams(new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(contentView);

        mWebView = new Web.View(this);
        mWebView.doSetting();
        mWebView.setWebViewClient(new Web.ViewClient(this));
        mWebView.setWebChromeClient(new Web.ChromeClient(this));
        mWebView.clearHistory();
        mWebView.clearCache(true);
        contentView.addView(mWebView);

        Intent intent = getIntent();
        String dataString = intent.getDataString();
        if (dataString != null) {
            mWebView.loadUrl("file:///android_asset/main.html?shortcut=" + dataString);
        } else {
            mWebView.loadUrl("file:///android_asset/main.html");
        }

        mWebView.requestFocus();
        mWebView.requestFocusFromTouch();

        mWebView.addJavascriptInterface(this, "Native_Main");
        mWebView.addJavascriptInterface(appl.db.js, "Native_Db");
    }

    @JavascriptInterface
    public void checkPermission(final String deferId, String permission) {
        ActivityResult.Permission activityResult = new ActivityResult.Permission(this) {
            @Override
            public void done(boolean granted) {
                if (granted) {
                    resolve(deferId, Rslt.ok());
                } else {
                    toast("Please grant required Permissions");
                }
            }
        };
        activityResult.checkPermissions(permission);
    }

    @JavascriptInterface
    public void toast(final String msg) {
        runOnUiThread(() -> {
            snackBar(msg, Snackbar.LENGTH_SHORT);
        });
    }

    @JavascriptInterface
    public void showError(String msg) {
        runOnUiThread(() -> {
            snackBar(msg, Snackbar.LENGTH_INDEFINITE);
        });
    }

    public void snackBar(String msg, int duration) {
        Snackbar snackbar = Snackbar.make(contentView, msg, duration);
        View snackbarView = snackbar.getView();
        snackbarView.setBackgroundColor(Color.parseColor("#20ff0000"));
        TextView textView = snackbarView.findViewById(android.support.design.R.id.snackbar_text);
        textView.setMaxLines(10);
        textView.setTextColor(Color.BLACK);
        snackbar.setActionTextColor(Color.BLACK);
        snackbar.setAction("X", view -> {
            snackbar.dismiss();
        });
        snackbar.show();
    }

    public void callJS(String function) {
        if (mWebView != null) mWebView.loadUrl("javascript:" + function + "()");
    }

    public void callJS(String function, String params) {
        params = params.replace("'", "\'");
        if (mWebView != null)
            mWebView.loadUrl("javascript:" + function + "('" + params + "')");
    }

    public void callJS(String function, String param1, String param2) {
        param1 = param1.replace("'", "\\'");
        param2 = param2.replace("'", "\\'");
        param2 = param2.replace(",", "\\,");
        String lsURL = "javascript:" + function + "('" + param1 + "','" + param2 + "')";
        mWebView.loadUrl(lsURL);
    }

    public void resolve(final String fsDeferId, final String rslt) {
        runOnUiThread(() -> callJS("callBack.resolve", fsDeferId, rslt));
    }

    @Override
    public void onBackPressed() {
        mWebView.evaluateJavascript("onBack.back();", (String rslt) -> {
            if (!"1".equals(rslt)) finish();
        });
    }

    @Override
    protected void onDestroy() {
        appl.destroy();
        appl = null;
        super.onDestroy();
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        ActivityResult.handleActivityResult(requestCode, resultCode, intent);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        ActivityResult.Permission activityResult = (ActivityResult.Permission) ActivityResult.activityResultMap.get(requestCode);
        activityResult.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    private ServiceConnection mConnection = new ServiceConnection() {
        public void onServiceConnected(ComponentName className, IBinder service) {
            mServiceMessenger = new Messenger(service);
            Util.log("onServiceConnected");
        }

        public void onServiceDisconnected(ComponentName className) {
            mServiceMessenger = null;
            Util.log("onServiceDisconnected");
        }
    };

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        String action = intent.getAction();
        if ("in.prcj.auditdemo.RELOAD".equals(action)) {
            mWebView.clearHistory();
            mWebView.clearCache(true);
            mWebView.loadUrl("file:///android_asset/main.html");
        }

        String dataString = intent.getDataString();
        if (dataString != null) {
            mWebView.loadUrl("file:///android_asset/main.html?shortcut=" + dataString);
        }
    }

    @JavascriptInterface
    public String createShortCut(String shortcut, String title, String icon) {
        try {
            Intent intent = new Intent(getApplicationContext(), MainActivity.class);
            intent.setData(Uri.parse(shortcut));

            int icon_id = R.drawable.my_drive_sync;

            Intent shortcutIntent = new Intent("com.android.launcher.action.INSTALL_SHORTCUT");
            shortcutIntent.putExtra("duplicate", false);
            shortcutIntent.putExtra(Intent.EXTRA_SHORTCUT_NAME, title);
            Parcelable shortcutIcon = Intent.ShortcutIconResource.fromContext(getApplicationContext(), icon_id);
            shortcutIntent.putExtra(Intent.EXTRA_SHORTCUT_ICON_RESOURCE, shortcutIcon);
            shortcutIntent.putExtra(Intent.EXTRA_SHORTCUT_INTENT, intent);
            sendBroadcast(shortcutIntent);
            return Rslt.ok();
        } catch (Throwable ex) {
            return Rslt.ex(ex);
        }
    }

    @JavascriptInterface
    public void exit() {
        finish();
    }

    @JavascriptInterface
    public String getLogcat() {
        return Util.getLogcat();
    }

    @JavascriptInterface
    public String clearLogcat() {
        try {
            String[] args = {"logcat", "-c"};
            Runtime.getRuntime().exec(args);
            return Rslt.ok();
        }
        catch (Exception ex)
        {
            return Rslt.ex(ex);
        }
    }
}
