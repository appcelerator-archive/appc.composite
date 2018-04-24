drop table if exists n1_employee_habit;
drop table if exists n1_employee_manager;
drop table if exists n1_employee;

create table n1_employee (id INT NOT NULL AUTO_INCREMENT, first_name VARCHAR(40), last_name VARCHAR(50), email_address VARCHAR(100), phone_number VARCHAR(20), state VARCHAR(30), PRIMARY KEY (id));
insert into n1_employee values (null, 'Fred', 'Flintstone', 'fred@flinstones.com', '800-443-2233', 'GA');
insert into n1_employee values (null, 'Joe', 'Jones', 'jj@jones.com', '800-232-5949', 'GA');
insert into n1_employee values (null, 'Tim', 'Jones', 'tim@jones.com', '800-111-2222', 'GA');
insert into n1_employee values (null, 'Frank', 'Jones', 'frank@jones.com', '800-222-2222', 'CA');
insert into n1_employee values (null, 'Martha', 'Jones', 'martha@jones.com', '800-333-3333', 'CA');
insert into n1_employee values (null, 'Sara', 'Jones', 'sara@jones.com', '800-444-4444', 'CA');
insert into n1_employee values (null, 'Jerry', 'Jones', 'jerry@jones.com', '800-555-5555', 'GA');
insert into n1_employee values (null, 'Mary', 'Smith', 'mary@smith.com', '800-666-6666', 'TX');
insert into n1_employee values (null, 'Joe', 'Smith', 'j@smith.com', '800-777-7777', 'TX');
insert into n1_employee values (null, 'Frank', 'Smith', 'f@smith.com', '800-888-8888', 'TX');
insert into n1_employee values (null, 'Larry', 'Smith', 'l@smith.com', '800-999-9999', 'NY');
insert into n1_employee values (null, 'Moe', 'Smith', 'm@smith.com', '800-123-1234', 'NY');
insert into n1_employee values (null, 'Sebastian', 'Smith', 's@smith.com', '800-234-2345', 'NY');

create table n1_employee_habit(id INT NOT NULL AUTO_INCREMENT, employee_id INT NOT NULL, habit VARCHAR(100) NOT NULL, PRIMARY KEY (id), FOREIGN KEY (employee_id) REFERENCES n1_employee (id) on delete cascade);
insert into n1_employee_habit values (null, 1, 'sleeps at work');
insert into n1_employee_habit values (null, 1, 'bumps into people in the hallway');
insert into n1_employee_habit values (null, 2, 'takes up two parking spaces');
insert into n1_employee_habit values (null, 2, 'leaves his keys in his car');
insert into n1_employee_habit values (null, 3, 'sings in public');
insert into n1_employee_habit values (null, 3, 'forgets phone');


create table n1_employee_manager(id INT NOT NULL AUTO_INCREMENT, employee_id INT NOT NULL, manager_name VARCHAR(100), PRIMARY KEY (id), FOREIGN KEY (employee_id) REFERENCES n1_employee (id) on delete cascade);
insert into n1_employee_manager values (null, 3, 'Mr. Zero');
insert into n1_employee_manager values (null, 5, 'Mrs. James');