package controllers

import (
	"github.com/gin-gonic/gin"
)

func GetAnime() gin.HandlerFunc {

	return func(c *gin.Context) {
		println("GetAnime API hit")
		c.JSON(200, gin.H{"message": "List of Anime"})
	}
}
