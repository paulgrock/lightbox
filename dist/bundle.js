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
        const imgTmpl = document.querySelector('#photo__image').content.querySelector('img')
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

    open(photoUrl, title, pos, total) {
        let lightBoxTmpl = document.querySelector('#light-box-tmpl').content.querySelector('#light-box__container')
        const lightBoxContainer = document.importNode(lightBoxTmpl, true)
        let lightBoxImg = lightBoxContainer.querySelector('#light-box__img')
        let lightBoxTitle = lightBoxContainer.querySelector('#light-box__title')
        let lightBoxContent = document.querySelector('#light-box__content')

        lightBoxTitle.textContent = title
        lightBoxImg.src = photoUrl
        lightBoxImg.alt = title

        if (!lightBoxContent) {
            let lightBoxNavItemTmpl = document.querySelector('#light-box-nav-tmpl').content.querySelector('li')
            const lightBoxNavContainer = lightBoxContainer.querySelector('#light-box__navigation')
            let index = 0
            while (index < total) {
                let lightBoxNav = document.importNode(lightBoxNavItemTmpl, true)
                let lightBoxNavControl = lightBoxNav.querySelector('button')
                lightBoxNavControl.dataset.pos = index
                if (index === pos) {
                    lightBoxNavControl.classList.add('active')
                }
                lightBoxNavContainer.appendChild(lightBoxNav)
                index += 1
            }
            let lightBoxEl = document.createElement('div')
            lightBoxEl.id = 'light-box'
            lightBoxEl.classList.add('light-box')
            lightBoxEl.appendChild(lightBoxContainer)
            document.body.appendChild(lightBoxEl)
        } else {
            let lightBoxContentFrag = document.createDocumentFragment()

            lightBoxContentFrag.appendChild(lightBoxTitle)
            lightBoxContentFrag.appendChild(lightBoxImg)
            lightBoxContent.innerHTML = ''
            lightBoxContent.appendChild(lightBoxContentFrag)
            document.querySelector('.light-box__nav-button.active').classList.remove('active')
            document.querySelectorAll('.light-box__nav-button')[pos].classList.add('active')
            document.querySelector('#light-box').classList.remove('hidden')
        }
    },
    update(photo, pos, total) {
        const {url, title} = photo
        this.open(url, title, pos, total)
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
