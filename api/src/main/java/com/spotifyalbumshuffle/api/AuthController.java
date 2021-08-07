package com.spotifyalbumshuffle.api;

import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.wrapper.spotify.SpotifyApi;
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.net.URI;

@RestController
public class AuthController {
    private static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId(System.getenv("SPOTIFY_CLIENT_ID"))
            .setClientSecret(System.getenv("SPOTIFY_CLIENT_SECRET"))
            .setRedirectUri(URI.create(System.getenv("SPOTIFY_REDIRECT_URI")))
            .build();

    private static final AuthorizationCodeUriRequest authorizationCodeUriRequest = spotifyApi.authorizationCodeUri()
            .scope("streaming,user-read-email,user-read-private,user-library-read,user-library-modify,user-read-playback-state,user-modify-playback-state")
            .build();

    @GetMapping("/api/auth/code-uri")
    public URI getAuthorizationCodeUri() {
        return authorizationCodeUriRequest.execute();
    }

    @GetMapping("/api/auth/callback")
    public RedirectView createSession(@RequestParam String code, HttpSession session) throws Exception {
        var authorizationCodeRequest = spotifyApi.authorizationCode(code).build();
        var authorizationCodeCredentials = authorizationCodeRequest.execute();
        session.setAttribute("accessToken", authorizationCodeCredentials.getAccessToken());
        session.setAttribute("refreshToken", authorizationCodeCredentials.getRefreshToken());
        session.setAttribute("expiresIn", authorizationCodeCredentials.getExpiresIn());
        return new RedirectView("http://localhost:3000");
    }

    @GetMapping("/api/auth/token")
    public String getAccessToken(HttpSession session) {
        return (String) session.getAttribute("accessToken");
    }

    @GetMapping("/api/auth/logout")
    public void logout(HttpServletRequest req) {
        req.getSession().invalidate();
    }
}
