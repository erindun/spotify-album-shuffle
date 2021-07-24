package com.spotifyalbumshuffle.api;

import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.wrapper.spotify.SpotifyApi;

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

    @GetMapping("/auth")
    public URI getAuthorizationCodeUri() {
        return authorizationCodeUriRequest.execute();
    }

    @GetMapping("/auth/callback")
    public AuthorizationCodeCredentials createSession(@RequestParam String code) throws Exception {
        var authorizationCodeRequest = spotifyApi.authorizationCode(code).build();
        var authorizationCodeCredentials = authorizationCodeRequest.execute();
        return authorizationCodeCredentials;
    }
}
