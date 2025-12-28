package routes

import (
	controller "github.com/TheDevotion/AniSuggest/Server/AniSuggestAnimeServer/controllers"
	"github.com/gin-gonic/gin"
)

func SetupUnProtectedRoutes(router *gin.Engine) {

	router.POST("/register", controller.RegisterUser())
	router.POST("/login", controller.LoginUser())
	router.GET("/animes", controller.GetAnimes())

}
