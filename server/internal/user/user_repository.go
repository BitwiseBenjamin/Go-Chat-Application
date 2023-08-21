package user

import (
	"context"
	"database/sql"
	"fmt"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
}

type repository struct {
	db DBTX
}

func NewRepository(db DBTX) Repository {
	return &repository{db: db}
}

func (r *repository) CreateUser(ctx context.Context, user *User) (*User, error) {
	var lastInsertId int
	query := "INSERT INTO users(username, password, email) VALUES ($1, $2, $3) returning id"
	err := r.db.QueryRowContext(ctx, query, user.Username, user.Password, user.Email).Scan(&lastInsertId)
	if err != nil {
		return &User{}, err
	}

	user.ID = int64(lastInsertId)
	return user, nil
}

func (r *repository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	u := User{}
	query := "SELECT id, email, username, password FROM users WHERE email = $1"
	err := r.db.QueryRowContext(ctx, query, email).Scan(&u.ID, &u.Email, &u.Username, &u.Password)
	if err != nil {
		return &User{}, nil
	}

	return &u, nil
}

func (r *repository) CreateMessage(ctx context.Context, message *Message) (*Message, error) {
	query := "INSERT INTO messages(username, room_id, content) VALUES ($1, $2, $3)"

	_, err := r.db.ExecContext(ctx, query, message.Username, message.RoomID, message.Content)
	if err != nil {
		fmt.Println("Error with db:", err)
		return nil, err
	}

	/*err := r.db.QueryRowContext(ctx, query, message.Username, message.RoomID, message.Content)
	if err != nil {
		fmt.Print("error with db")
		fmt.Print(err.)
		return &Message{}, nil
	}*/
	return message, nil
}

func (r *repository) GetAllMessages(ctx context.Context, req *GetAllMessagesReq) (*[]Message, error) {
	var messages []Message

	query := "SELECT username, room_id, content FROM messages WHERE room_id = $1"
	fmt.Print("ROOMID: " + req.RoomID)
	rows, err := r.db.QueryContext(ctx, query, req.RoomID)
	if err != nil {
		fmt.Println("error with db at get all: " + err.Error())
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		if err := rows.Scan(&message.Username, &message.RoomID, &message.Content); err != nil {
			fmt.Print(err)
			return nil, err
		}
		messages = append(messages, message)

	}
	fmt.Print(messages)

	/*res := &GetAllMessagesRes{
		Messages: messages,
	}*/

	return &messages, nil
}
