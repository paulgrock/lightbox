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
