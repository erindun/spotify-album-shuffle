declare module 'common' {
  export interface AccessToken {
    value: string;
    expiresAt: string;
  }

  export interface Album {
    uri: string;
    name: string;
    artist: string;
    artworkUrl: string;
    trackIds: string[];
  }
}
