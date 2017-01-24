const lightBox = require('./light-box')
const photos = require('./photos')
const images = require('./images')

const FLICKR_API_KEY = '8f5975594ed590941d283a951f4f9a7f'
const PER_PAGE = 10
const PHOTO_SET_ID = '72157626579923453'
const USER_ID = '30966612@N02'

let state = {
    currentPhotoPosition: 0,
    photos: [],
    isLightBoxCreated: false
}

const setPositionAndUpdateLightBox = (position) => {
    const oldPosition = state.currentPhotoPosition
    state.currentPhotoPosition = position
    lightBox.update(state.photos[position], position, oldPosition)
}

// Event listener for opening the light box
document.querySelector('#photo-grid').addEventListener('click', (evt) => {
    const {target} = evt
    if (target.nodeName === 'IMG') {
        if (state.isLightBoxCreated === false) {
            lightBox.create(state.photos.length)
            state.isLightBoxCreated = true
        }
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
        let currentPhotoPosition = state.currentPhotoPosition
        if (id === 'light-box__next' && currentPhotoPosition < state.photos.length - 1) {
            currentPhotoPosition += 1
        }

        if (id === 'light-box__prev' && currentPhotoPosition > 0) {
            currentPhotoPosition -= 1
        }
        setPositionAndUpdateLightBox(currentPhotoPosition)
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
