insert into users
    (user_username, user_tel, user_password, user_status, user_age)
  values ('boburmirzo', '+998902121212', '1', 23, 21)
returning *





insert into users
    (user_username, user_tel, user_password, user_status, user_age)
  values ('boburmirzo', '+998902121212', '356a192b7913b04c54574d18c28d46e6395428ab', 23, 21)
returning *
// PASSWORD = 1

insert into users
    (user_username, user_tel, user_password, user_status, user_age)
  values ('boburmirzo', '+998998616951', '356a192b7913b04c54574d18c28d46e6395428ab', 1, 21)
returning * 
// PASSWORD = 1


insert into admins
    (admin_username, admin_password)
  values ('boburmirzo', '8cb2237d0679ca88db6464eac60da96345513964')
returning *;
// PASSWORD = 12345

insert into admins
    (admin_username, admin_password)
  values ('boburmirzo', '28921bb3d3967c383228393581fefe2c68f43fb1')
returning *;
// PASSWORD = bobur1907

insert into movie_category
    (category_id, movie_id)
  values ('dc5000dd-5299-41b4-9b14-7e28e2e2582f', '7c92dbf5-9d4c-4d42-9f59-1f4998d310ad')
returning *



