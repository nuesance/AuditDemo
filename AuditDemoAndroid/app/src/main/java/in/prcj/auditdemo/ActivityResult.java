package in.prcj.auditdemo;

import android.content.*;
import android.content.pm.*;
import android.support.annotation.*;
import android.support.v4.app.*;
import android.support.v4.content.*;

import java.util.*;

import in.prcj.auditdemo.util.*;

public class ActivityResult {
    public static final int RC_SIGN_IN = 9001;
    public static final int RC_OPEN_DOCUMENT_TREE = 9002;
    public static final int RC_PERMISSIONS = 9003;
    public static final int RC_GENERAL = 9004;
    public static final int RC_GD_OPEN_FILE = 9005;

    public static HashMap<Integer, ActivityResult> activityResultMap = new HashMap<>();

    public MainActivity main;
    public Appl appl;

    public ActivityResult(MainActivity main) {
        this.main = main;
        appl = main.appl;
    }

    public void toast(String msg) {
        main.toast(msg);
    }

    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
    }

    public static void handleActivityResult(int requestCode, int resultCode, Intent intent) {
        try {
            ActivityResult activityResult = activityResultMap.get(requestCode);
            activityResult.onActivityResult(requestCode, resultCode, intent);
            activityResultMap.remove(requestCode);
        } catch (Throwable ex) {
            Util.log(ex);
        }
    }

    public void startActivityForResult(Intent intent, int requestCode) {
        activityResultMap.put(requestCode, this);
        main.startActivityForResult(intent, requestCode);
    }

    public static class Permission extends ActivityResult {
        String[] requiredPermissions;

        public Permission(MainActivity main) {
            super(main);
        }

        public void checkPermissions(String permission) {
            requiredPermissions = permission.split(",");
            for (int i = 0; i < requiredPermissions.length; i++) {
                if (!requiredPermissions[i].contains("."))
                    requiredPermissions[i] = "android.permission." + requiredPermissions[i];
            }
            try {
                List<String> permissionsNeeded = getPermissionsNeeded(requiredPermissions);
                if (permissionsNeeded.isEmpty()) {
                    done(true);
                } else {
                    activityResultMap.put(RC_PERMISSIONS, this);
                    ActivityCompat.requestPermissions(main, permissionsNeeded.toArray(new String[permissionsNeeded.size()]), RC_PERMISSIONS);
                }
            } catch (Throwable ex) {
                toast(ex.getMessage());
                main.finish();
            }
        }

        public List<String> getPermissionsNeeded(String[] permissions) {
            List<String> permissionsNeeded = new ArrayList<>();
            try {
                for (String permission : permissions) {
                    int result = ContextCompat.checkSelfPermission(main, permission);
                    if (result != PackageManager.PERMISSION_GRANTED) {
                        permissionsNeeded.add(permission);
                    }
                }
            } catch (Throwable ex) {
                Util.log(ex);
                toast(ex.getMessage());
                main.finish();
            }
            return permissionsNeeded;
        }

        public void onRequestPermissionsResult(int requestCode, @NonNull String requestedPermissions[], @NonNull int[] grantResults) {
            activityResultMap.remove(requestCode);
            List<String> permissionsMissing = getPermissionsNeeded(requiredPermissions);
            done(permissionsMissing.isEmpty());
        }

        public void done(boolean granted) {
        }

    }

    public static class Generic extends ActivityResult {

        public Generic(MainActivity main) {
            super(main);
        }

        public String start(Intent intent) {
            try {
                startActivityForResult(intent, RC_GENERAL);
                return Rslt.ok();
            } catch (Throwable ex) {
                Util.log(ex);
                return Rslt.ex(ex);
            }
        }
    }
}
