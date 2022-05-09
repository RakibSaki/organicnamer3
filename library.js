class Distance {
    constructor(atom, distance) {
        this.atom = atom
        this.distance = distance
    }
}

class Atom {
    constructor(x, y, bondWith) {
        this.x = x
        this.y = y
        this.draw()
        this.bonds = []
        this.distances = []
        if (!bondWith) {
            return
        }
        let bondLine = document.createElement('div')
        bondLine.classList.add('bond')
        bondLine.style.left = `${(this.x + bondWith.x) / 2}px`
        bondLine.style.top = `${(this.y + bondWith.y) / 2}px`
        let width = Math.sqrt(((this.x - bondWith.x) * (this.x - bondWith.x)) + ((this.y - bondWith.y) * (this.y - bondWith.y)))
        bondLine.style.width = `${width}px`
        let rotate = Math.atan((bondWith.y - this.y) / (bondWith.x - this.x))
        bondLine.style.transform = `translate(${width / -2}px, -1px) rotate(${rotate}rad)`
        document.body.appendChild(bondLine)
        // record bond
        this.bonds.push(bondWith)
        bondWith.bonds.push(this)
        // record distance with every other atom
        for (let distance of bondWith.distances) {
            this.distances.push(new Distance(
                distance.atom, 1 + distance.distance))
            distance.atom.distances.push(new Distance(
                this, 1 + distance.distance))
        }
        // record distance with bonded atom
        this.distances.push(new Distance(bondWith, 1))
        bondWith.distances.push(new Distance(this, 1))
        // record molecule
        bondWith.molecule.add(this)
    }

    distanceFrom(atom) {
        for (let i = 0; i < this.distances.length; i++) {
            if (atom == this.distances[i].atom) {
                return this.distances[i].distance
            }
        }
        return NaN
    }

    draw() {
        this.element = document.createElement('div')
        this.element.classList.add('atom')
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`
        document.body.appendChild(this.element)
    }
}

class Molecule {
    constructor(atom) {
        this.atoms = []
        if (atom) {
            this.atoms.push(atom)
        }
    }
    add(atom) {
        atom.molecule = this
        this.atoms.unshift(atom)
        for (let i = 0; i < this.atoms.length; i++) {
            this.atoms[i].element.innerHTML = ''
        }
        atom.element.innerHTML = atom.element.innerHTML + '\n' + nameParentChain(this.parentChain())
    }
    parentChain() {
        if (this.atoms.length == 1) {
            return [this.atoms[0]]
        }
        let terminalAtoms = []
        for (let i = 0; i < this.atoms.length; i++) {
            if (this.atoms[i].bonds.length == 1) {
                terminalAtoms.push(this.atoms[i])
            }
        }
        console.log(terminalAtoms.length)
        for (let i = 0; i < terminalAtoms.length; i++) {
            terminalAtoms[i].element.innerHTML = `${i + 1} terminal`
        }
        let longestChains = [{ length: 0, between: [null, null] }]
        // record longest chain(s)
        for (let i = 0; i < terminalAtoms.length; i++) {
            for (let j = 0; j < terminalAtoms.length; j++) {
                if (i !== j) {
                    let distance = terminalAtoms[i].distanceFrom(terminalAtoms[j])
                    if (distance > longestChains[0].length) {
                        longestChains = [
                            {
                                length: distance,
                                between: [terminalAtoms[i], terminalAtoms[j]]
                            }
                        ]
                        continue
                    }
                    if (distance == longestChains[0].length) {
                        longestChains.push(
                            {
                                length: distance,
                                between: [terminalAtoms[i], terminalAtoms[j]]
                            })
                    }
                }
            }
        }
        longestChains[0].between[0].element.innerHTML = 'from'
        longestChains[0].between[1].element.innerHTML = 'to'
        // if several longest chains, just choosing the first longest chain for now
        let result = [longestChains[0].between[0]]
        // keep adding atom to the chain from between[0] to between[1]
        while (result[0] !== longestChains[0].between[1]) {
            // the next atom in the chain will be bonded the last added atom
            let candidates = result[0].bonds
            // the next atom will be one closer the the last added atom
            let distanceNeeded = result[0].distanceFrom(longestChains[0].between[1]) - 1
            // the atom with 0 distance from between[1] is between[1] itself, and the chain is complete
            if (distanceNeeded == 0) {
                result.unshift(longestChains[0].between[1])
                continue
            }
            for (let i = 0; i < candidates.length; i++) {
                if (candidates[i].distanceFrom(longestChains[0].between[1]) == distanceNeeded) {
                    result.unshift(candidates[i])
                    continue
                }
            }
        }
        for (let i = 0; i < result.length; i++) {
        }
        return result
    }
}

let names = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec']

function nameParentChain(parentChain) {
    return names[parentChain.length - 1] + 'ane'
}