package user

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

type Handler struct {
	Service
}

func NewHandler(s Service) *Handler {
	return &Handler{
		Service: s,
	}
}

func (h *Handler) CreateUser(c *gin.Context) {
	var u CreateUserReq
	if err := c.ShouldBindJSON(&u); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := h.Service.CreateUser(c.Request.Context(), &u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *Handler) Login(c *gin.Context) {
	var user LoginUserReq
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u, err := h.Service.Login(c.Request.Context(), &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("jwt", u.accessToken, 60*60*24, "/", "localhost", false, true)
	c.JSON(http.StatusOK, u)
}

func (h *Handler) Logout(c *gin.Context) {
	c.SetCookie("jwt", "", -1, "", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "logout successful"})
}

func (h *Handler) CreateMessage(c *gin.Context) {
	var m CreateMessageReq

	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.RoomID = c.Param("roomId")

	res, err := h.Service.CreateMessage(c.Request.Context(), &m)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *Handler) GetAllMessages(c *gin.Context) {
	roomID := c.Param("roomId")
	fmt.Print("ROOMID " + roomID + " ROOMID")

	var messagesReq = &GetAllMessagesReq{
		RoomID: roomID,
	}

	res, err := h.Service.GetAllMessages(c.Request.Context(), messagesReq)
	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)

}

func (h *Handler) ValidateToken(c *gin.Context) {

	// Get the JWT token from the cookie
	cookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
		return
	}

	// Parse the token and validate its authenticity
	tokenString := strings.TrimPrefix(cookie, "jwt=")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		// Provide your JWT secret key here
		return []byte("your-secret-key"), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
		return
	}

	// Token is valid, extract user information and respond
	claims, ok := token.Claims.(*MyJWTClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":    true,
		"username": claims.Username,
		"id":       claims.ID,
	})
}
