declare module 'common' {
  export interface AccessToken {
    value: string;
    expiresAt: string;
  }

  export interface Album {
    uris: string[];
    name: string;
    artist: string;
    artworkUrl: string;
  }
}
