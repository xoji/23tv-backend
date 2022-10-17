create extension "uuid-ossp";
create database tv23;


create table users (
  user_id uuid not null default uuid_generate_v4() primary key,
  user_username character varying(32) not null,
  user_path character varying(128),
  user_tel character varying(32) not null unique,
  user_password character varying(128) not null,
  user_status int not null default 1,
  user_age int not null default 0
);

create table admins (
  admin_id uuid not null default uuid_generate_v4() primary key,
  admin_username character varying(32) not null,
  admin_password character varying(128) not null,
  admin_status int not null default 1
);


insert into admins
    (admin_username, admin_password, admin_status)
  values ('boburmirzo', 'bobur1907', '-1')
returning *;

-- bobur1907 -> 28921bb3d3967c383228393581fefe2c68f43fb1

create table categories (
  category_id uuid not null default uuid_generate_v4() primary key,
  category_name character varying(32) not null,
  category_name_ru character varying(32) not null
);

create table genres (
  genre_id uuid not null default uuid_generate_v4() primary key,
  genre_name character varying(32) not null,
  genre_name_ru character varying(32) not null
);

create table countries (
  country_id uuid not null default uuid_generate_v4() primary key,
  country_name character varying(32) not null,
  country_name_ru character varying(32) not null
);


create table actors (
  actor_id uuid not null default uuid_generate_v4() primary key,
  actor_path character varying(128) not null,
  actor_name character varying(32) not null,
  actor_name_ru character varying(32) not null,
  actor_profession character varying(32),
  actor_profession_ru character varying(32)
);

create table directors (
  director_id uuid not null default uuid_generate_v4() primary key,
  director_path character varying(128) not null,
  director_name character varying(32) not null,
  director_name_ru character varying(32) not null,
  director_profession character varying(32),
  director_profession_ru character varying(32)
);

-- CREATE UNIQUE INDEX ON movies(movie_unique_name);

create table ads (
  ads_id uuid not null default uuid_generate_v4() primary key,
  ads_path character varying(128) not null,
  ads_link character varying(128)
);


create table movies (
  movie_id uuid not null default uuid_generate_v4() primary key,
  movie_name character varying(128) not null,
  movie_name_ru character varying(128) not null,
  movie_path character varying(128) not null,
  movie_thumnail_path character varying(128) not null,
  movie_premeire_date character varying(64) not null,
  movie_genre text not null,
  movie_genre_ru text not null,
  movie_body text not null,
  movie_body_ru text not null,
  movie_rate int not null,
  movie_serial_is BOOLEAN NOT NULL default false,
  movie_length character varying(16) not null,
  movie_4k_is BOOLEAN NOT NULL default false,
  movie_country uuid not null,
  movie_screen character varying(128) not null,
  movie_age int not null,
  movie_unique_name character varying(128),
  serial_count int default 0
);

ALTER TABLE movies
ADD COLUMN movie_actors text default '';

ALTER TABLE movies
ADD COLUMN movie_actors_ru text default '';

ALTER TABLE movies
ADD COLUMN movie_directors text default '';

ALTER TABLE movies
ADD COLUMN movie_directors_ru text default '';

ALTER TABLE movies
ADD COLUMN is_national BOOLEAN;



create table histories (
    history_id  uuid not null default uuid_generate_v4() primary key,
    user_id uuid not null references users(user_id),
    created_at timestamptz default current_timestamp,
    movie_id uuid not null references movies(movie_id)
);


create table movie_serials (
    movie_serial_id  uuid not null default uuid_generate_v4() primary key,
    movie_name character varying(128) not null,
    movie_name_ru character varying(128) not null,
    movie_path character varying(128) not null,
    movie_length character varying(16) not null,
    movie_4k_is BOOLEAN NOT NULL default false,
    movie_id uuid not null references movies(movie_id)
);


create table movie_genres (
    movie_genre_id  uuid not null default uuid_generate_v4() primary key,
    genre_id uuid not null references genres(genre_id),
    movie_id uuid not null references movies(movie_id)
);

create table movie_category (
    movie_category_id  uuid not null default uuid_generate_v4() primary key,
    category_id uuid not null references categories(category_id),
    movie_id uuid not null references movies(movie_id)
);

create table movie_actors (
    movie_actor_id  uuid not null default uuid_generate_v4() primary key,
    actor_id uuid not null references actors(actor_id),
    movie_id uuid not null references movies(movie_id)
);

create table movie_directors (
    movie_director_id  uuid not null default uuid_generate_v4() primary key,
    director_id uuid not null references directors(director_id),
    movie_id uuid not null references movies(movie_id)
);

create table trillers (
  triller_id uuid not null default uuid_generate_v4() primary key,
  triller_name character varying(128) not null,
  triller_name_ru character varying(128) not null,
  triller_path character varying(128) not null,
  triller_4k_is BOOLEAN NOT NULL default false,
  triller_thumnail_path character varying(128),
  triller_premeire_date character varying(64),
  triller_genre text,
  triller_genre_ru text,
  triller_body text,
  triller_body_ru text,
  triller_rate int,
  triller_country_id uuid,
  triller_screen character varying(128),
  triller_age int,
  movie_id character varying(128) default null
);


create table triller_genres (
    triller_genre_id  uuid not null default uuid_generate_v4() primary key,
    genre_id uuid not null references genres(genre_id),
    triller_id uuid not null references trillers(triller_id)
);

create table triller_category (
    triller_category_id  uuid not null default uuid_generate_v4() primary key,
    category_id uuid not null references categories(category_id),
    triller_id uuid not null references trillers(triller_id)
);

create table triller_actors (
    triller_actor_id  uuid not null default uuid_generate_v4() primary key,
    actor_id uuid not null references actors(actor_id),
    triller_id uuid not null references trillers(triller_id)
);

create table triller_directors (
    triller_director_id  uuid not null default uuid_generate_v4() primary key,
    director_id uuid not null references directors(director_id),
    triller_id uuid not null references trillers(triller_id)
);

create table favourite_movies (
  favourite_movie_id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null references users(user_id),
  created_at timestamptz default current_timestamp,
  movie_id uuid not null references movies(movie_id)
);

CREATE UNIQUE INDEX ON favourite_movies(movie_id);

create table recommended_movies (
  recommended_movie_id uuid not null default uuid_generate_v4() primary key,
  movie_id uuid not null references movies(movie_id)
);

CREATE UNIQUE INDEX ON recommended_movies(movie_id);

create table recommended_trillers (
  recommended_triller_id uuid not null default uuid_generate_v4() primary key,
  triller_id uuid not null references trillers(triller_id)
);

CREATE UNIQUE INDEX ON recommended_trillers(triller_id);

create table comments (
  comment_id uuid not null default uuid_generate_v4() primary key,
  comment_body character varying(256) not null,
  created_at timestamptz default current_timestamp,
  user_id uuid not null references users(user_id),
  movie_id uuid not null references movies(movie_id)
);


create table live_status (
  live_status_id uuid not null default uuid_generate_v4() primary key,
  live_status_status bool not null default false,
  liveTitle character varying(128) default '',
  liveBody text default ''
);

create table lives (
  live_id uuid not null default uuid_generate_v4() primary key,
  live_title character varying(32) not null,
  live_body character varying(128) not null,
  finished_at timestamptz default current_timestamp
);

create table live_likes (
  live_likes_id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null references users(user_id),
  live_body character varying(128) not null,
  live_id uuid not null references lives(live_id)
);
  
CREATE TABLE user_pays(
    order_id SERIAL PRIMARY KEY,
    amount INT NOT NULL,
    status INT DEFAULT 0,
    payed INT DEFAULT 0,
    user_id uuid not null references users(user_id)
);

ALTER TABLE click_transactions(
    amount INT NOT NULL,
    status INT DEFAULT 0,
    merchant_prepare_id varchar(32),
    click_transaction_id varchar(32),
	  state INT DEFAULT '1',
    click_prepare_confirm timestamptz DEFAULT current_timestamp,
    reason varchar(32),
    create_time timestamptz DEFAULT current_timestamp,
    cancel_time timestamptz,
    perform_time timestamptz,
    order_id INT,
    user_id uuid not null references users(user_id)
);

CREATE TABLE payme_transactions(
    amount INT NOT NULL,
    status INT DEFAULT 0,
    merchant_prepare_id varchar(32),
    click_transaction_id varchar(32),
	  state INT DEFAULT '1',
    click_prepare_confirm timestamptz DEFAULT current_timestamp,
    reason varchar(32),
    create_time timestamptz DEFAULT current_timestamp,
    cancel_time timestamptz,
    perform_time timestamptz,
    order_id INT references user_pays(order_id),
    user_id uuid not null references users(user_id)
);
create table seasons(
    season_id uuid NOT NULL default uuid_generate_v4() primary key,
    season_num int,
    movie_id uuid not NULL references movies(movie_id)
);
ALTER TABLE movie_serials
ADD COLUMN season_id uuid references seasons(season_id);
CREATE TABLE verify_code_check(verify_id uuid NOT NULL default uuid_generate_v4() primary key, code INT NOT NULL, phone_number character varying(128) not null);
ALTER TABLE click_transactions DELETE COLUMN order_id


create table payme_transactions (
  id uuid not null default uuid_generate_v4() primary key,
  amount INT NOT NULL,
  trans_id text NOT NULL,
  time INT NOT NULL,
  payed BOOLEAN NOT NULL default false,
  canceled BOOLEAN NOT NULL default false,
  create_time text NOT NULL,
  perform_time text,
  cancel_time text,
  reason INT,
  createdat timestamptz DEFAULT current_timestamp,
  updatedat timestamptz,
  order_id INT
);
