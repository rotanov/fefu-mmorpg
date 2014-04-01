DROP DATABASE IF EXISTS "fefu-mmorpg";

CREATE DATABASE "fefu-mmorpg";

CREATE USER server WITH password "123";

GRANT ALL ON DATABASE "fefu-mmorpg" TO server;

CREATE TABLE IF NOT EXISTS users (
    id    serial       NOT NULL PRIMARY KEY
    login varchar(36)  NOT NULL UNIQUE,
    pass  varchar(128) NOT NULL,
    salt  varchar(64)  NOT NULL,
    sid   varchar(40)  NOT NULL DEFAULT '',
    x     real         NOT NULL DEFAULT 0.0,
    y     real         NOT NULL DEFAULT 0.0
);