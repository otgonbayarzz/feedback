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

