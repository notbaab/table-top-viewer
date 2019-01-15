package table_top_viewer

import (
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

var schema = `
CREATE TABLE IF NOT EXISTS User (
    id  integer PRIMARY KEY AUTOINCREMENT,
    username string,
    passhash string
);

CREATE TABLE IF NOT EXISTS Game (
    id integer PRIMARY KEY AUTOINCREMENT,
    gm_id integer,
    url text,
    game_data text,
    FOREIGN KEY (gm_id) REFERENCES User(id)
);
`

type Game struct {
	Id       int    `db:"id"`
	Url      string `db:"url"`
	GmId     int    `db:"gm_id"`
	GameData string `db:"game_data"`
}

type User struct {
	Id       int    `db:"id"`
	Username string `db:"username"`
	Passhash string `db:"passhash"`
}

func runSchema(db *sqlx.DB) {
	db.MustExec(schema)
}

func RunStatment(db *sqlx.DB, sql string) {
	db.MustExec(sql)
}

func UpdateGame(db *sqlx.DB, game Game) {
	sqlStatement := `UPDATE Game
            SET game_data = ?
            WHERE id = ?;`

	db.MustExec(sqlStatement, game.GameData, game.Id)
}

func GetGame(db *sqlx.DB, id int) (Game, error) {
	game := Game{}
	err := db.Get(&game, "SELECT * FROM Game WHERE id=?", id)
	if err != nil {
		return game, err
	}

	return game, nil
}

func SetupDatabase(database string) *sqlx.DB {
	db := sqlx.MustConnect("sqlite3", database)
	runSchema(db)

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
// var id int
// var user User
// rows, err := db.NamedQuery("INSERT INTO users (email) VALUES (:email) RETURNING id", user)
// // handle err
// if rows.Next() {
//     rows.Scan(&id)
// }
// type Player struct {
//     Id      int   `db:"id"`
//     ClassId int   `db:"class_id"`
//     GameId  int   `db:"game_id"`
//     Class   Class `db:"class"`
//     Game    Game  `db:"game"`
// }

// type Class struct {
//     Id        int    `db:"id"`
//     ImageUrl  string `db:"img_url"`
//     FrameData string `db:"frame_data"`
//     Stats     string `db:"stats"`
// }
// this was annoying to figure out, I'm keeping it
// func other(db *sqlx.DB) {
// 	var players []Player
// 	query := `SELECT
//         player.*,
//         game.id "game.id",
//         game.url "game.url"
//         FROM player
//         JOIN Game ON player.game_id = game.id where game.id = 1;`
// 	err := db.Select(&players, query)
// 	if err != nil {
// 		Error.Fatalln(err.Error())
// 	}
// 	fmt.Printf("%+v\n", players[0])
// 	fmt.Printf("%+v\n", players[0].Game.Url)
// }
