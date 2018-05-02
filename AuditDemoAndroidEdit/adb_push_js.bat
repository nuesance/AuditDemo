adb devices

adb push ..\AuditDemoAndroid\app\src\main\assets\www\main.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\util.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\ui.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\db.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\apps.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\tools.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\audit_case.js /sdcard/Android/data/in.prcj.auditdemo/files/www
adb push ..\AuditDemoAndroid\app\src\main\assets\www\default_data.js /sdcard/Android/data/in.prcj.auditdemo/files/www

adb push ..\AuditDemoAndroid\app\src\main\assets\www\project.css /sdcard/Android/data/in.prcj.auditdemo/files/www

adb shell am start -n in.prcj.auditdemo/.MainActivity -a in.prcj.auditdemo.RELOAD
