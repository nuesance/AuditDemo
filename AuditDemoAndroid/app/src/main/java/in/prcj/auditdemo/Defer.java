package in.prcj.auditdemo;

public class Defer<T> {
    Callback<T> moCallBack;
    T moResult;
    String msMessage;
    int status = 0;

    public void resolve(T result) {
        moResult = result;
        status = 1;
        if (moCallBack != null) {
            moCallBack.done(moResult);
            moCallBack = null;
            moResult = null;
        }
    }

    public void reject(String message) {
        msMessage = message;
        status = 2;
        if (moCallBack != null) {
            moCallBack.fail(msMessage);
            moCallBack = null;
            msMessage = null;
        }
    }

    public void then(Callback<T> callBack) {
        moCallBack = callBack;
        if (status == 1) {
            moCallBack.done(moResult);
            moCallBack = null;
            moResult = null;
        }
        if (status == 2) {
            moCallBack.fail(msMessage);
            moCallBack = null;
            msMessage = null;
        }
    }
}
