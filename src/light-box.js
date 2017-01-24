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
