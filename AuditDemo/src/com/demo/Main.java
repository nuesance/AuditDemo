package com.demo;

import com.sun.net.httpserver.*;

import java.io.*;
import java.net.*;
import java.util.*;

public class Main implements HttpHandler {
    public static int port = 9002;
    public static HttpServer server;

    public Rslt process(HashMap<String, Object> rqst) {
        try {
            String process = Util.getStr(rqst, "process");
            Rslt rslt = Rslt.errRslt("Invalid processCmd " + process);
            if ("db".equals(process)) {
                Db db = new Db();
                rslt = db.process(rqst);
            }
            return rslt;
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public void handle(HttpExchange he) throws IOException {
        HashMap<String, Object> rqst = new HashMap<>();
        HashMap<String, String> qry = new HashMap<>();

        try {
            String path = he.getRequestURI().getPath();
            String q = he.getRequestURI().getQuery();
            String reqMethod = he.getRequestMethod().toUpperCase();
            if (q != null) {
                for (String param : q.split("&")) {
                    String pair[] = param.split("=");
                    if (pair.length > 1) {
                        qry.put(pair[0], pair[1]);
                    } else {
                        qry.put(pair[0], "");
                    }
                }
            }

            if (reqMethod.equals("GET")) {
                processAsset(he, path, qry);
                return;
            }

            if (he.getRequestMethod().equalsIgnoreCase("GET") && q != null) {
                for (String param : q.split("&")) {
                    String pair[] = param.split("=");
                    if (pair.length > 1) {
                        rqst.put(pair[0], pair[1]);
                    } else {
                        rqst.put(pair[0], "");
                    }
                }
            } else {
                String rqstStr = new String(Util.readStream(he.getRequestBody()));
                rqst = (HashMap) Buff.parse(rqstStr);
            }

            Rslt rslt = process(rqst);
            sendResult(he, rslt);
        } catch (Throwable ex) {
            ex.printStackTrace();
            sendResult(he, Rslt.exRslt(ex));
        }
    }

    public void sendResult(HttpExchange he, Rslt rslt) {
        try {
            setHeaders(he, HttpURLConnection.HTTP_OK);
            OutputStream os = he.getResponseBody();
            os.write(rslt.stringify().getBytes());
            os.close();
        } catch (Throwable ex) {
            System.out.println(ex.getMessage());
            ex.printStackTrace();
        }
    }

    public void setHeaders(HttpExchange he, int rc) {
        try {
            Headers headers = he.getResponseHeaders();
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "POST");
            headers.add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            he.sendResponseHeaders(rc, 0);
        } catch (Throwable ex) {
            System.out.println(ex.getMessage());
            ex.printStackTrace();
        }
    }

    public Rslt processAsset(HttpExchange he, String path, HashMap<String, String> qry) throws IOException {
        try {
            byte[] bytes;
            Headers headers = he.getResponseHeaders();

            if (path.startsWith("/svg/")) {
                File file = new File("www" + path + ".svg");
                if (!file.exists()) return fileNotFound(he, file);
                String fill = qry.get("fill");
                bytes = Util.readFile(file.getPath());
                String data = new String(bytes);
                if (fill != null) {
                    data = data.replace("<path", "<path fill=\"" + fill + "\"");
                    bytes = data.getBytes();
                    headers.set("Content-Type", "image/svg+xml");
                }
            } else {
                File file = new File("www" + path);
                if (!file.exists()) return fileNotFound(he, file);
                bytes = Util.readFile(file.getPath());
                String extn = path.substring(path.lastIndexOf(".") + 1);
                headers.set("Content-Type", "text/" + extn);
            }

            he.sendResponseHeaders(HttpURLConnection.HTTP_OK, 0);
            OutputStream os = he.getResponseBody();
            os.write(bytes);
            os.close();
            return Rslt.okRslt();
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public Rslt fileNotFound(HttpExchange he, File file) throws IOException {
        try {
            System.out.println("File not found " + file.getAbsolutePath());
            setHeaders(he, HttpURLConnection.HTTP_NOT_FOUND);
            OutputStream os = he.getResponseBody();
            os.write("404 (Not Found)\n".getBytes());
            os.close();
            return Rslt.okRslt();
        } catch (Throwable ex) {
            return Rslt.exRslt(ex);
        }
    }

    public static void main(String[] args) {
        try {
            new Main().processCmd(args);
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    public void processCmd(String[] args) throws IOException {
        String cmd = "start";
        if (args.length > 0) cmd = args[0];
        System.out.println("Executing command " + cmd + " port " + port);

        if ("stop".equals(cmd)) {
            stop();
        } else {
            start();
        }
    }

    public void start() throws IOException {
        if (server == null) server = HttpServer.create(new InetSocketAddress(port), 0);
        System.out.println("Server started at " + port);
        server.createContext("/", this);
        server.setExecutor(null);
        server.start();
    }

    public void stop() {
        if (server == null) {
            System.out.println("Server not running");
            return;
        }
        try {
            server.stop(0);
            server = null;
            System.out.println("Server stopped");
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    protected void finalize() throws Throwable {
        stop();
    }
}
