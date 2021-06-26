import { Album } from 'common';
import SpotifyWebApi from 'spotify-web-api-node';

export class SpotifyAlbumShuffleApi {
  spotifyApi: SpotifyWebApi;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
    });
  }

  async fetchAllSavedAlbums(
    accessToken: string
  ): Promise<SpotifyApi.SavedAlbumObject[]> {
    this.spotifyApi.setAccessToken(accessToken);
    const albums: SpotifyApi.SavedAlbumObject[] = [];
    try {
      const response = await this.spotifyApi.getMySavedAlbums({
        limit: 50,
        offset: 0,
      });
      const numAlbums = response.body.total;

      for (let i = 0; i < numAlbums; i += 50) {
        const data = await this.spotifyApi.getMySavedAlbums({
          limit: 50,
          offset: i,
        });

        albums.push(...data.body.items);
      }
      return albums;
    } catch (err) {
      return Promise.reject(new Error('Failed to get saved albums'));
    }
  }
}

export function mapAlbumMetadata(
  albums: SpotifyApi.SavedAlbumObject[]
): Album[] {
  return albums.map(({ album }) => ({
    uris: album.tracks.items.map(({ uri }) => uri),
    name: album.name,
    artist: album.artists[0].name,
    artworkUrl: album.images[0].url,
  }));
}
