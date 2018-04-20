package in.prcj.auditdemo;

public abstract class Callback<T> {
    public abstract void done(final T result);

    public void fail(String message) {
        Util.log(message);
    }
}
