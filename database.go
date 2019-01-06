package main

import (
	// "database/sql"

	"fmt"
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
INSERT INTO Class (img_url, frame_data, stats) VALUES('img/wizard.png', '{"id":123}', '{"move":6}');
INSERT INTO Player (class_id, game_id) VALUES(1, 1);
INSERT INTO Player (class_id, game_id) VALUES(2, 1);
`

type Game struct {
	Id  int    `db:"id"`
	Url string `db:"url"`
}

type Class struct {
	Id        int    `db:"id"`
	ImageUrl  string `db:"img_url"`
	FrameData string `db:"frame_data"`
	Stats     string `db:"stats"`
}

type Player struct {
	Id      int   `db:"id"`
	ClassId int   `db:"class_id"`
	GameId  int   `db:"game_id"`
	Class   Class `db:"class"`
	Game    Game  `db:"game"`
}

func runSchema(db *sqlx.DB) {
	db.MustExec(schema)
}

func setupDatabase(database string) *sqlx.DB {
	db := sqlx.MustConnect("sqlite3", database)
	runSchema(db)
	other(db)

	return db
}

// func getFullPlayerData(db *sqlx.DB) {
// 	query := `SELECT
//         player.*,
//         game.id "game.id",
//         game.url "game.url"
//         FROM player
//         JOIN Game ON player.game_id = game.id
//         JOIN Class on player.class_id = class.id WHERE game.id = 1;`

// }

func other(db *sqlx.DB) {
	var players []Player
	query := `SELECT
        player.*,
        game.id "game.id",
        game.url "game.url"
        FROM player
        JOIN Game ON player.game_id = game.id where game.id = 1;`
	err := db.Select(&players, query)
	if err != nil {
		Error.Fatalln(err.Error())
	}
	fmt.Printf("%+v\n", players[0])
	fmt.Printf("%+v\n", players[0].Game.Url)
}
