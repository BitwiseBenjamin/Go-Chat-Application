package user

import "context"

type User struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type Message struct {
	Content  string `json:"content"`
	RoomID   string `json:"roomid"`
	Username string `json:"username"`
}

type CreateUserReq struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CreateUserRes struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type LoginUserReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginUserRes struct {
	accessToken string
	ID          string `json:"id"`
	Username    string `json:"username"`
}

type CreateMessageReq struct {
	Content  string `json:"content"`
	RoomID   string `json:"roomid"`
	Username string `json:"username"`
}

type CreateMessageRes struct {
	Content  string `json:"content"`
	RoomID   string `json:"roomid"`
	Username string `json:"username"`
}

type GetAllMessagesReq struct {
	RoomID string `json:"roomid"`
}
type GetAllMessagesRes struct {
	Messages *[]Message `json:"messages"`
}

type Repository interface {
	CreateUser(ctx context.Context, user *User) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	CreateMessage(ctx context.Context, user *Message) (*Message, error)
	GetAllMessages(ctx context.Context, req *GetAllMessagesReq) (*[]Message, error)
}

type Service interface {
	CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error)
	CreateMessage(ctx context.Context, user *CreateMessageReq) (*CreateMessageRes, error)
	Login(c context.Context, req *LoginUserReq) (*LoginUserRes, error)
	GetAllMessages(ctx context.Context, req *GetAllMessagesReq) (*GetAllMessagesRes, error)
}
