package main

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

var db *sqlx.DB

var schema = `
CREATE TABLE IF NOT EXISTS Game (
    id integer PRIMARY KEY AUTOINCREMENT,
    url text
);

CREATE TABLE IF NOT EXISTS Player (
    id integer PRIMARY KEY AUTOINCREMENT,
    class_id int,
    game_id int,
    FOREIGN KEY (class_id) REFERENCES Class(id)
    FOREIGN KEY (game_id) REFERENCES Game(id)
);

CREATE TABLE IF NOT EXISTS Class (
    id integer PRIMARY KEY AUTOINCREMENT,
    img_url text,
    frame_data text,
    stats text
);
`

var testQuery = `
INSERT INTO Game (url) VALUES('/12345');
INSERT INTO Class (img_url, frame_data, stats) VALUES('img/wizard.png', '{"id":12}', '{"move":6}');
INSERT INTO Player (class_id, game_id) VALUES(1, 1);
`

type Game struct {
	Id  string `db:"id"`
	Url string `db:"url"`
}

type Player struct {
	Country string
	City    sql.NullString
	TelCode int
}

func runSchema(db *sqlx.DB) {
	db.MustExec(schema)
}

func setupDatabase(database string) *sqlx.DB {
	db := sqlx.MustConnect("sqlite3", database)
	runSchema(db)

	return db
}
