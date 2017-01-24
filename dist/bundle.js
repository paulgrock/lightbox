(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Handles creating and displaying the images for the grid

const createImage = ({thumbUrl, title, index, imgTmpl}) => {
    const imgEl = document.importNode(imgTmpl, false)
    imgEl.src = thumbUrl
    imgEl.alt = title
    imgEl.dataset.pos = index
    return imgEl
}

module.exports = {
    create(images) {
        const frag = document.createDocumentFragment()
        const imgTmpl = document.querySelector('#photo-image-tmpl').content.querySelector('img')
        images.forEach(({thumbUrl, title}, index) => {
            const imgEl = createImage({
                thumbUrl,
                title,
                index,
                imgTmpl
            })
            frag.appendChild(imgEl)
        })
        return frag
    },
    display(imgContainer) {
        return document.querySelector('#photo-grid').appendChild(imgContainer)
    }
}

},{}],2:[function(require,module,exports){
module.exports = {
    close() {
        let lightBoxEl = document.querySelector('#light-box')
        lightBoxEl.classList.add('hidden')
    },

    create(total) {
        let lightBoxTmpl = document.querySelector('#light-box-tmpl').content.querySelector('#light-box')
        const lightBox = document.importNode(lightBoxTmpl, true)
        let lightBoxNavItemTmpl = document.querySelector('#light-box-nav-tmpl').content.querySelector('li')
        const lightBoxNavContainer = lightBox.querySelector('#light-box__navigation')
        let index = 0
        while (index < total) {
            let lightBoxNav = document.importNode(lightBoxNavItemTmpl, true)
            let lightBoxNavControl = lightBoxNav.querySelector('button')
            lightBoxNavControl.dataset.pos = index
            lightBoxNavContainer.appendChild(lightBoxNav)
            index += 1
        }
        document.body.appendChild(lightBox)
    },

    update(photo, position, oldPosition) {
        const {url, title} = photo
        const lightBoxContainerEl = document.querySelector('#light-box__container')
        if (!lightBoxContainerEl) {
            return
        }
        const navItems = document.querySelectorAll('.light-box__nav-item')
        const lightBoxFigureTmpl = document.querySelector('#light-box-image-tmpl').content.querySelector('#light-box__figure')
        const lightBoxFigure = document.importNode(lightBoxFigureTmpl, true)
        let lightBoxTitle = lightBoxFigure.querySelector('#light-box__title')
        let lightBoxImg = lightBoxFigure.querySelector('#light-box__img')

        lightBoxTitle.textContent = title
        lightBoxImg.src = url
        lightBoxImg.alt = title

        // Lightbox element already in DOM
        const lightBoxFigureEl = document.querySelector('#light-box__figure')
        if (lightBoxFigureEl) {
            lightBoxContainerEl.replaceChild(lightBoxFigure, lightBoxFigureEl)
        } else {
            lightBoxContainerEl.appendChild(lightBoxFigure)
        }

        navItems[oldPosition].classList.remove('active')
        navItems[position].classList.add('active')
        document.querySelector('#light-box').classList.remove('hidden')
    }
}

},{}],3:[function(require,module,exports){
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

},{"./images":1,"./light-box":2,"./photos":4}],4:[function(require,module,exports){
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

},{}]},{},[3]);
