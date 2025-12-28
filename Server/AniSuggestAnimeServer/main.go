package main

import (
	"fmt"

	"github.com/TheDevotion/AniSuggest/Server/AniSuggestAnimeServer/routes"
	"github.com/gin-gonic/gin"
)

func main() {

	router := gin.Default()

	router.GET("/hello", func(c *gin.Context) {
		c.String(200, "Hello ani suggest")
	})

	routes.SetupUnProtectedRoutes(router)
	routes.SetupProtectedRoutes(router)

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to start server", err)
	}

}
