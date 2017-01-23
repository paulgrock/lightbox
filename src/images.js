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
