package com.demo;

import org.apache.commons.dbcp2.*;

import java.sql.*;
import java.util.*;
import java.util.Date;

public class Db {

    public Db() {
    }

    public Rslt process(HashMap<String, Object> rqst) {
        String method = Util.getStr(rqst, "method");
        Rslt rslt = Rslt.errRslt("Invalid method " + method);
        String tname = Util.getStr(rqst, "tname");
        String id = Util.getStr(rqst, "id");
        String data = Util.getStr(rqst, "data");
        if ("add".equals(method)) {
            rslt = add(tname, id, data);
        } else if ("getAll".equals(method)) {
            rslt = getAll(tname);
        } else if ("set".equals(method)) {
            rslt = set(tname, id, data);
        } else if ("put".equals(method)) {
            rslt = put(tname, id, data);
        } else if ("delAll".equals(method)) {
            rslt = delAll(tname);
        }
        return rslt;
    }

    public String createKey() {
        long ts = new Date().getTime();
        return Buff.numToStr(ts);
    }

    public Rslt createTable(String tname) {
        String sql = "Create table " + tname + " (id Varchar(10) Not Null primary key, data Varchar(5000) Not Null)";
        return execute(sql);
    }

    public void createTable(String tname, String[] extraCols) {
        String sql = "Create Table If Not Exists " + tname + " (id text Not Null, data text Not Null,";
        for (int i = 0; i < extraCols.length; i++) {
            sql += " " + extraCols[i] + " text,";
        }
        sql += " Constraint " + tname + "_pk Primary Key (id))";
        execute(sql);
    }

    public Rslt dropTable(String tname) {
        String sql = "Drop Table If Exists " + tname;
        return execute(sql);
    }

    public boolean isEmpty(String tname) {
        try {
            Connection con = Pool.getConnection();
            String sql = "Select id From " + tname;
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            boolean empty = true;
            while (rs.next()) {
                empty = false;
                break;
            }
            rs.close();
            con.close();
            return empty;
        } catch (Exception ex) {
            throw new Error(ex);
        }
    }

    public boolean exists(String tname, String id) {
        try {
            Connection con = Pool.getConnection();
            String sql = "Select id From " + tname + " Where id = '" + id + "'";
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            boolean exists = false;
            while (rs.next()) {
                exists = true;
                break;
            }
            rs.close();
            con.close();
            return exists;
        } catch (Exception ex) {
            throw new Error(ex);
        }
    }

    public String getAsStr(String tname, String id) {
        try {
            Connection con = Pool.getConnection();
            String sql = "Select data From " + tname + " Where id = '" + id + "'";
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            String val = null;
            while (rs.next()) {
                val = rs.getString(1);
                break;
            }
            rs.close();
            con.close();
            return val;
        } catch (Exception ex) {
            throw new Error(ex);
        }
    }

    public Object get(String tname, String id) {
        String val = getAsStr(tname, id);
        return val == null ? null : Buff.parse(val);
    }

    public HashMap<String, Object> getAsMap(String tname, String id) {
        String val = getAsStr(tname, id);
        return val == null ? null : (HashMap<String, Object>) Buff.parse(val);
    }

    public Rslt getAll(String tname) {
        HashMap<String, Object> map = new HashMap<>();
        try {
            Connection con = Pool.getConnection();
            String sql = "Select id, data From " + tname;
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                String id = rs.getString(1);
                String data = rs.getString(2);
                map.put(id, Buff.parse(data));
            }
            rs.close();
            con.close();
            return Rslt.okRslt(map);
        } catch (Exception ex) {
            return Rslt.exRslt(ex);
        }
    }

    public HashMap<String, HashMap<String, Object>> getAllAsMap(String tname) {
        HashMap<String, HashMap<String, Object>> map = new HashMap<>();
        try {
            Connection con = Pool.getConnection();
            String sql = "Select id, data From " + tname;
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            String val = null;
            while (rs.next()) {
                String id = rs.getString(1);
                String data = rs.getString(2);
                map.put(id, (HashMap<String, Object>) Buff.parse(data));
            }
            rs.close();
            con.close();
            return map;
        } catch (Exception ex) {
            throw new Error(ex);
        }
    }

    public Rslt add(String tname, String id, String data) {
        return execute("Insert Into " + tname + " Values ('" + id + "', '" + data + "')");
    }

    public Rslt set(String tname, String id, String data) {
        try {
            execute("Update  " + tname + " Set data = '" + data + "' Where id = '" + id + "'");
            return Rslt.okRslt();
        } catch (Exception ex) {
            return Rslt.exRslt(ex);
        }
    }

    public Rslt put(String tname, String id, String data) {
        try {
            boolean exists = exists(tname, id);
            if (exists) {
                execute("Update  " + tname + " Set data = '" + data + "' Where id = '" + id + "'");
            } else {
                execute("Insert Into " + tname + " Values ('" + id + "', '" + data + "')");
            }
            return Rslt.okRslt();
        } catch (Exception ex) {
            return Rslt.exRslt(ex);
        }
    }

    public void del(String tname, String id) {
        execute("Delete From  " + tname + " Where id = '" + id + "'");
    }

    public Rslt delAll(String tname) {
        //execute("Delete From  " + tname);
        Rslt rslt = dropTable(tname);
        if (rslt.rc != 0) return rslt;
        return createTable(tname);
    }

    public Rslt execute(String sql) {
        Connection con = null;
        try {
            con = Db.Pool.getConnection();
            con.createStatement().execute(sql);
            con.commit();
            con.close();
            return Rslt.okRslt();
        } catch (Exception ex) {
            return Rslt.exRslt(ex);
        } finally {
            close(con);
        }
    }

    public void close(Connection con) {
        try {
            con.close();
        } catch (Exception ex) {
        }
    }


    public static class Pool {
        private static BasicDataSource dataSource;

        public static Connection getConnection() throws SQLException {
            return Pool.getDataSource().getConnection();
        }

        public static BasicDataSource getDataSource() {
            if (dataSource == null) {
                BasicDataSource ds = new BasicDataSource();
                ds.setUrl("jdbc:hsqldb:file:db/audit_demo");
                ds.setUsername("SA");
                ds.setPassword("");
                ds.setDefaultAutoCommit(false);


                ds.setMinIdle(5);
                ds.setMaxIdle(10);
                ds.setMaxOpenPreparedStatements(100);

                dataSource = ds;
            }
            return dataSource;
        }
    }
}
