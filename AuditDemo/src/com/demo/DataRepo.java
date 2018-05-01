package com.demo;

import java.sql.*;
import java.util.Date;

public class DataRepo {
    public static void main(String[] args) throws Exception {
        DataRepo dataRepo = new DataRepo();
        //dataRepo.resetCity();
        //dataRepo.resetCourse();
        dataRepo.resetStudent();
    }

    public void resetCity() throws Exception {
        Connection con = Db.Pool.getConnection();
        con.createStatement().execute(dropCity);
        con.createStatement().execute(createCity);

        PreparedStatement ps = con.prepareStatement("Insert Into city(name) values(?)");
        for (int i = 0; i < city_data.length; i++) {
            ps.setString(1, city_data[i]);
            ps.executeUpdate();
        }
        con.commit();
        con.close();
    }

    public void resetCourse() throws Exception {
        Connection con = Db.Pool.getConnection();
        con.createStatement().execute(dropCourse);
        con.createStatement().execute(createCourse);

        PreparedStatement ps = con.prepareStatement("Insert Into course(name) values(?)");
        for (int i = 0; i < course_data.length; i++) {
            ps.setString(1, course_data[i]);
            ps.executeUpdate();
        }
        con.commit();
        con.close();
    }

    public void resetStudent() throws Exception {
        Connection con = Db.Pool.getConnection();

        con.createStatement().execute(dropStudent);
        con.createStatement().execute(createStudent);
        con.createStatement().execute(alterStudent);

        for (int i = 0; i < 200; i++) {
            int pos = (int) (Math.random() * DataRepo.person_data.length);
            int pos2 = (int) (Math.random() * DataRepo.person_data.length);
            String name = DataRepo.person_data[pos][0] + " " + DataRepo.person_data[pos2][1];
            String email = DataRepo.person_data[pos][0] + "." + DataRepo.person_data[pos2][1] + "@gmail.com";
            String password = "password";
            String gender = DataRepo.person_data[pos][2];
            int city_id = (int) (Math.random() * DataRepo.city_data.length) + 1;
            Date birth_date = new java.util.Date(100 - (int) (Math.random() * 20), (int) (Math.random() * 11), (int) (Math.random() * 30) + 1);
            int education = (int) (Math.random() * 3) + 1;
            String about = "About Student";
            String active_flg = "Y";
            Date record_date = new Date(115 - (int) (Math.random() * 2), (int) (Math.random() * 11), (int) (Math.random() * 30) + 1);

            String sql = "Insert into student(name, email, password, gender, city_id, birth_date, education, about, active_flg, record_date)" +
                    " Values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, password);
            ps.setString(4, gender);
            ps.setInt(5, city_id);
            ps.setDate(6, new java.sql.Date(birth_date.getTime()));
            ps.setInt(7, education);
            ps.setString(8, about);
            ps.setString(9, active_flg);
            ps.setDate(10, new java.sql.Date(record_date.getTime()));
            ps.executeUpdate();
        }

        con.commit();
        con.close();
    }

    public static String dropCity = "Drop table If Exists city";
    public static String createCity = "Create table city (id Integer Auto_Increment primary key, name Varchar(50) Not Null)";

    public static String dropCourse = "Drop table If Exists course";
    public static String createCourse = "Create table course (id Integer Auto_Increment primary key, name Varchar(50) Not Null)";

    public static String dropStudent = "Drop table If Exists Student";
    public static String createStudent = "Create table Student (" +
            "  id Integer Auto_Increment primary key," +
            "  name Varchar(50) Not Null," +
            "  email Varchar(50)," +
            "  password Varchar(50) Not Null," +
            "  gender Varchar(1) Not Null," +
            "  city_id Integer Not Null," +
            "  birth_date Date," +
            "  education Integer Not Null," +
            "  about Varchar(250)," +
            "  active_flg Varchar(1) Not Null," +
            "  record_date Date" +
            ")";
    public static String alterStudent = "Alter table Student Add Constraint student_city_fk Foreign Key (city_id) References city (id)";


    public static String[] city_data = new String[]
            {
                    "Adana",
                    "Amsterdam",
                    "Ankara",
                    "Athens",
                    "Bandung",
                    "Bangalore",
                    "Bangkok",
                    "Barcelona",
                    "Beijing",
                    "Berlin",
                    "Buenos Aires",
                    "Cairo",
                    "Cape Town",
                    "Chicago",
                    "Córdoba",
                    "Curitiba",
                    "Delhi",
                    "Donetsk",
                    "Eindhoven",
                    "Florence",
                    "Frankfurt",
                    "Glasgow",
                    "Gothenburg",
                    "Guangzhou",
                    "Hai Phong",
                    "Hamburg",
                    "Hanoi",
                    "Houston",
                    "Hyderabad",
                    "Istanbul",
                    "Izmir",
                    "Jakarta",
                    "Kraków",
                    "Kunming",
                    "Kyiv",
                    "Lisbon",
                    "Liverpool",
                    "London",
                    "Los Angeles",
                    "Lyon",
                    "Madrid",
                    "Manchester",
                    "Melbourne",
                    "Mexico City",
                    "Milano",
                    "Montreal",
                    "Moscow",
                    "Mumbai",
                    "Munich",
                    "New York",
                    "Nice",
                    "Nonthaburi",
                    "Paris",
                    "Petersburg",
                    "Porto",
                    "Rio de Janeiro",
                    "Rome",
                    "Salvador",
                    "São Paulo",
                    "Semarang",
                    "Shanghai",
                    "Stockholm",
                    "Surabaya",
                    "Sydney",
                    "Tijuana",
                    "Torino",
                    "Toronto",
                    "Toulouse",
                    "Volos",
                    "Warsaw"
            };

    public static String[][] person_data = new String[][]
            {
                    new String[]{"Halil", "Kalkan", "M"},
                    new String[]{"Karen", "Asimov", "F"},
                    new String[]{"Neo", "Gates", "M"},
                    new String[]{"Trinity", "Lafore", "F"},
                    new String[]{"Morpheus", "Maalouf", "M"},
                    new String[]{"Suzanne", "Hayyam", "F"},
                    new String[]{"Georghe", "Richards", "M"},
                    new String[]{"Steeve", "Orwell", "M"},
                    new String[]{"Agatha", "Jobs", "F"},
                    new String[]{"Stephan", "Christie", "M"},
                    new String[]{"Andrew", "Hawking", "M"},
                    new String[]{"Nicole", "Brown", "F"},
                    new String[]{"Thomas", "Garder", "M"},
                    new String[]{"Oktay", "More", "M"},
                    new String[]{"Paulho", "Anar", "M"},
                    new String[]{"Carl", "Sagan", "M"},
                    new String[]{"Daniel", "Radcliffe", "F"},
                    new String[]{"Rupert", "Grint", "M"},
                    new String[]{"David", "Yates", "M"},
                    new String[]{"Hercules", "Poirot", "M"},
                    new String[]{"Christopher", "Paolini", "M"},
                    new String[]{"Walter", "Isaacson", "M"},
                    new String[]{"Arda", "Turan", "M"},
                    new String[]{"Jeniffer", "Anderson", "F"},
                    new String[]{"Stephenie", "Mayer", "F"},
                    new String[]{"Dan", "Brown", "M"},
                    new String[]{"Clara", "Clayton", "F"},
                    new String[]{"Emmett", "Brown", "M"},
                    new String[]{"Marty", "Mcfly", "M"},
                    new String[]{"Jane", "Fuller", "F"},
                    new String[]{"Douglas", "Hall", "M"},
                    new String[]{"Tom", "Jones", "M"},
                    new String[]{"Lora", "Adams", "F"},
                    new String[]{"Andy", "Garcia", "M"},
                    new String[]{"Amin", "Collins", "M"},
                    new String[]{"Elmander", "Sokrates", "M"},
                    new String[]{"Austin", "Cleeve", "F"},
                    new String[]{"Audrey", "Cole", "F"},
                    new String[]{"Bella", "Clark", "F"},
                    new String[]{"Burley", "Pugy", "M"},
                    new String[]{"Charles", "Quiney", "M"}};

    public static String[] course_data = new String[]
            {
                    "Mathematics",
                    "Physics",
                    "Chemistry",
                    "Introduction to Programming I",
                    "Introduction to Programming II",
                    "Microcomputers",
                    "Probability",
                    "Fuzzy logic",
                    "Neural network",
                    "Experts systems",
                    "History",
                    "Data structures",
                    "Differential Equations",
                    "Lineer Algebra",
                    "Object oriented programming",
                    "Computer graphics",
                    "Artificial Intelligence",
                    "Foreign Language",
                    "Operating Systems",
                    "Database",
                    "Data communication",
                    "Finite-state machines",
                    "Compiler design",
                    "Computer vision",
                    "Computer networks I",
                    "Computer networks II",
                    "Wireless communication",
                    "Digital signal processing",
                    "Optimization",
                    "Robotics",
                    "Data mining"
            };
}
