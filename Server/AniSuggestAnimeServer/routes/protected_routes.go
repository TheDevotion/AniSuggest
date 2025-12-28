package routes

import (
	controller "github.com/TheDevotion/AniSuggest/Server/AniSuggestAnimeServer/controllers"
	"github.com/TheDevotion/AniSuggest/Server/AniSuggestAnimeServer/middleware"
	"github.com/gin-gonic/gin"
)

func SetupProtectedRoutes(router *gin.Engine) {
	router.Use(middleware.AuthMiddleWare())

	router.GET("/anime/:imdb_id", controller.GetAnime())

	router.POST("/addanime", controller.AddAnime())
	router.GET("/recommendedanimes", controller.GetRecommendedAnimes())
	router.PATCH("/updatereview/:imdb_id", controller.AdminReviewUpdate())
}
