let molecules = []
let selected

let mouseOnAtom = false

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        if (!mouseOnAtom) {
            let newAtom = new Atom(event.clientX, event.clientY, selected)
            drawAtom(newAtom)
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
                showName(molecules[0])
                selected = molecules[0].atoms[0]
                selected.element.classList.add('selected-atom')
                return
            }
            selected.element.classList.remove('selected-atom')
            selected = newAtom
            selected.element.classList.add('selected-atom')
            showName(newAtom.molecule)
        }
    })
})

function drawAtom(atom) {
    atom.element = document.createElement('div')
    atom.element.classList.add('atom')
    atom.element.style.transform = `translate(${atom.x}px, ${atom.y}px)`
    document.body.appendChild(atom.element)
    if (!atom.bondWith) {
        return
    }
    let bondLine = document.createElement('div')
    bondLine.classList.add('bond')
    bondLine.style.left = `${(atom.x + atom.bondWith.x) / 2}px`
    bondLine.style.top = `${(atom.y + atom.bondWith.y) / 2}px`
    let width = Math.sqrt(((atom.x - atom.bondWith.x) * (atom.x - atom.bondWith.x)) + ((atom.y - atom.bondWith.y) * (atom.y - atom.bondWith.y)))
    bondLine.style.width = `${width}px`
    let rotate = Math.atan((atom.bondWith.y - atom.y) / (atom.bondWith.x - atom.x))
    bondLine.style.transform = `translate(${width / -2}px, -1px) rotate(${rotate}rad)`
    bondLine.style.zIndex = '-1'
    document.body.appendChild(bondLine)
}

function showName(molecule) {
    for (let i = 0; i < molecule.atoms.length; i++) {
        molecule.atoms[i].element.innerHTML = ''
    }
    molecule.atoms[0].element.innerHTML = '\n' + nameParentChain(molecule.parentChain())
}