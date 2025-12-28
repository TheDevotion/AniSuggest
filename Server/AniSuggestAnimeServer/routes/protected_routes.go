package routes

import (
	controller "github.com/TheDevotion/AniSuggest/Server/AniSuggestAnimeServer/controllers"
	"github.com/TheDevotion/AniSuggest/Server/AniSuggestAnimeServer/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleWare())

	router.GET("/anime/:imdb_id", controller.GetAnime(client))

	router.POST("/addanime", controller.AddAnime(client))
	router.GET("/recommendedanimes", controller.GetRecommendedAnimes(client))
	router.PATCH("/updatereview/:imdb_id", controller.AdminReviewUpdate(client))
}
