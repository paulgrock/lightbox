const lightBox = require('./light-box')
const photos = require('./photos')
const images = require('./images')

const FLICKR_API_KEY = '8f5975594ed590941d283a951f4f9a7f'
const PER_PAGE = 10
const PHOTO_SET_ID = '72157626579923453'
const USER_ID = '30966612@N02'

let state = {
    currentPhotoPos: 0,
    photos: []
}

const setPositionAndUpdateLightBox = (pos) => {
    state.currentPhotoPos = pos
    lightBox.update(state.photos[pos], pos, state.photos.length)
}

// Event listener for opening the light box
document.querySelector('#photo-grid').addEventListener('click', (evt) => {
    const {target} = evt
    if (target.nodeName === 'IMG') {
        setPositionAndUpdateLightBox(Number(target.dataset.pos))
    }
})

// Event listeners for closing the light box and updating it
document.body.addEventListener('click', (evt) => {
    let {id, classList} = evt.target

    // convert classList into a real array from array like
    classList = [...classList]
    if (id === 'light-box__close-button' || id === 'light-box') {
        lightBox.close()
        return
    }

    if (classList.includes('light-box__next-prev')) {
        let currentPhotoPos = state.currentPhotoPos
        if (id === 'light-box__next' && currentPhotoPos < state.photos.length - 1) {
            currentPhotoPos += 1
        }

        if (id === 'light-box__prev' && currentPhotoPos > 0) {
            currentPhotoPos -= 1
        }
        setPositionAndUpdateLightBox(currentPhotoPos)
    }

    if (classList.includes('light-box__nav-button')) {
        setPositionAndUpdateLightBox(Number(evt.target.dataset.pos))
    }

})

// Fetch photos and display them
photos.fetch({
    photoSetId: PHOTO_SET_ID,
    apiKey: FLICKR_API_KEY,
    perPage: PER_PAGE,
    userId: USER_ID
}).
    then((photoJson) => {
        state.photos = photos.map(photoJson)
        return state.photos
    }).
    then(images.create).
    then(images.display).
    catch(e => console.error(e))
