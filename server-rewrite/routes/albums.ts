import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { spotifyApi } from '../app';
import { Album } from '../types';

/** Fetches all saved albums from the user's Spotify library. */
async function fetchAllSavedAlbums(
  spotifyApi: SpotifyWebApi
): Promise<SpotifyApi.SavedAlbumObject[]> {
  const albums: SpotifyApi.SavedAlbumObject[] = [];
  try {
    const response = await spotifyApi.getMySavedAlbums({
      limit: 50,
      offset: 0,
    });
    const numAlbums = response.body.total;

    for (let i = 0; i < numAlbums; i += 50) {
      const data = await spotifyApi.getMySavedAlbums({
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

/** Converts a `SpotifyApi.SavedAlbumObject` list to an `Album` list. */
function makeAlbums(albums: SpotifyApi.SavedAlbumObject[]): Album[] {
  return albums.map(({ album }) => ({
    uris: album.tracks.items.map(({ uri }) => uri),
    name: album.name,
    artist: album.artists[0].name,
    artworkUrl: album.images[0].url,
  }));
}

/** Router for `/api/albums`. */
export const albumsRouter = express.Router();

/* GET all saved albums from user's Spotify library. */
albumsRouter.get('/', async (req, res) => {
  if (req.session.access_token) {
    spotifyApi.setAccessToken(req.session.access_token);
    try {
      const albumObjects = await fetchAllSavedAlbums(spotifyApi);
      const albums = makeAlbums(albumObjects);
      res.send(albums);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.status(401);
  }
});
