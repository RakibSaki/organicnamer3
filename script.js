let molecules = []
let selected

let mouseOnAtom = false

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        if (!mouseOnAtom) {
            let newAtom = new Atom(event.clientX, event.clientY, selected)
            mouseOnAtom = true
            newAtom.element.addEventListener('mouseover', () => {
                mouseOnAtom = true
            })
            newAtom.element.addEventListener('mouseout', () => {
                mouseOnAtom = false
            })
            newAtom.element.addEventListener('click', () => {
                if (selected == newAtom) {
                    selected.element.classList.remove('selected-atom')
                    selected = null
                    return
                }
                if (selected) {
                    selected.element.classList.remove('selected-atom')
                }
                if (newAtom.bonds.length == 4) {
                    return
                }
                selected = newAtom
                selected.element.classList.add('selected-atom')
            })
            if (!selected) {
                molecules.unshift(new Molecule)
                molecules[0].add(newAtom)
                molecules[0].showName()
                selected = molecules[0].atoms[0]
                selected.element.classList.add('selected-atom')
                return
            }
            selected.element.classList.remove('selected-atom')
            selected = newAtom
            selected.element.classList.add('selected-atom')
        }
    })
})