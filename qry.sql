#create user qry

create table user
(
	id int auto_increment,
	username varchar(100),
	`password` varchar(100),
	is_admin boolean,
	company_id int,
	primary key (id)
)

#company
create table company
(
	id int auto_increment,
	name varchar(100),
	industry varchar(100),
	phone varchar(100),
	info varchar(2000),
	
	
	primary key (id)
)

#prospect
create table prospect
(
	id int auto_increment,
	firstname varchar(100),
	lastname varchar(100),
	phone_number varchar(100),
	reg_number varchar(100),
	image LONGTEXT,
	primary key (id)
)

#
