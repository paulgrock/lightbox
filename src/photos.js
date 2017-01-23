// Handles fetching and manipulating of the photos for the grid

const getPhotoUrl = ({farmId, serverId, id, secret, size = ''}) => `https://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}${size}.jpg`

module.exports = {
    fetch({photoSetId, apiKey, perPage, userId}) {
        const FLICKR_URL = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&photoset_id=${photoSetId}&format=json&nojsoncallback=1&per_page=${perPage}&user_id=${userId}&api_key=${apiKey}`
        return fetch(FLICKR_URL).
            then(res => res.json())
    },
    map(photoJson) {
        return photoJson.photoset.photo.map((photo) => {
            const {id, secret, farm, server, title} = photo
            /*
                Size '_n' is small, 320 on longest side according to
                https://www.flickr.com/services/api/misc.urls.html
            */
            return {
                url: getPhotoUrl({
                    id: id,
                    secret: secret,
                    farmId: farm,
                    serverId: server
                }),
                thumbUrl: getPhotoUrl({
                    id: id,
                    secret: secret,
                    farmId: farm,
                    serverId: server,
                    size: '_n'
                }),
                title
            }
        })
    }
}
