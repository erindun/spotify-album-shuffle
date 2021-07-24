package com.spotifyalbumshuffle.api;

import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wrapper.spotify.SpotifyApi;

import java.net.URI;

@RestController
public class AuthController {
    private static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId("472ab70014b14093b29c76597187f2d0")
            .setClientSecret("05fd13c211df4bf2a36fdff06d85efb1")
            .setRedirectUri(URI.create("http://localhost:5000/api/auth/callback"))
            .build();

    private static final AuthorizationCodeUriRequest authorizationCodeUriRequest = spotifyApi.authorizationCodeUri()
            .scope("user-read-birthdate,user-read-email")
            .build();

    @GetMapping("/auth")
    public URI getAuthUrl() {
        var uri = authorizationCodeUriRequest.execute();
        System.out.println(uri);
        return uri;
    }

    @GetMapping("/auth/callback")
    public void createSession() {

    }
}
