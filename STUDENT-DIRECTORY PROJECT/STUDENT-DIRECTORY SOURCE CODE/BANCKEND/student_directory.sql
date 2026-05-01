CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  role TEXT
);
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  couse TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  user_id INTEGER
  );

INSERT INTO users VALUES ('0001', 'LaoneKM', '1234','admin');
INSERT INTO students VALUES ('24019382',	'Keith Moyo',	'computer science',	'keith@biust.ac.bw',	'777777');
INSERT INTO students VALUES ('24019762',	'Marry James',	'Physics',	'marry@biust.ac.bw',	'11111');
INSERT INTO students VALUES ('24019850',	'Harry Verma',	'Information systems',	'harry@biust.ac.bw',	'00000')

