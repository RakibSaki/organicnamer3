let molecules = []
let selected = []

document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded')
    document.body.addEventListener('click', event => {
        console.log('click')
        if (selected.length == 0) {
            molecules.unshift(new Molecule)
            molecules[0].add(new Atom(event.offsetX, event.offsetY))
            selected.push(molecules[0].atoms[0])
            return
        }
        let newAtom = new Atom(event.offsetX, event.offsetY, selected[0])
        selected[0] = newAtom
    })
})