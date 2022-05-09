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
        // record bond
        this.bonds = [bondWith]
        bondWith.bonds.push(this)
        // record distance with bonded atom
        this.distances = [new Distance(bondWith, 1)]
        bondWith.distances.push(new Distance(this, 1))
        // record distance with every other atom
        for (let distance of bondWith.distances) {
            this.distances.push(new Distance(
                distance.atom, 1 + distance.disatnce))
            distance.atom.distances.push(new Distance(
                this, 1 + distance.distance))
        }
        // record molecule
        this.molecule = bondWith.molecule
        bondWith.molecule.atoms.push(this)
    }

    distanceFrom(atom) {
        for (let i = 0; i < this.distances.length; i++) {
            if (atom == this.distances[i].atom) {
                return this.distances[i].distance
            }
        }
        return NaN
    }
}

class Molecule {
    constructor(atom) {
        this.atoms = [atom]
    }
    parentChain() {
        terminalAtoms = []
        for (let i = 0; i < this.atoms.length; i++) {
            if (this.atoms[i].bonds.length == 1) {
                terminalAtoms.push(this.atoms[i])
            }
        }
        let longestChains = [{ length: 0, between: [null, null] }]
        // record longest chain(s)
        for (let i = 0; i < this.atoms.length; i++) {
            for (let j = 0; j < this.atoms.length; j++) {
                if (this.atoms[i] !== this.atoms[j]) {
                    let distance = this.atoms[i].distanceFrom(this.atoms[j])
                    if (distance > longestChains[0].length) {
                        longestChains = [
                            {
                                length: distance,
                                between: [this.atoms[i], this.atoms[j]]
                            }
                        ]
                        continue
                    }
                    if (distance == longestChains[0].length) {
                        longestChains.append(
                            {
                                length: distance,
                                between: [this.atoms[i], this.atoms[j]]
                            })
                    }
                }
            }
        }
        // if several longest chains, just choosing the first longest chain for now
        result = [longestChains[0].between[0]]
        // keep adding atom to the chain from between[0] to between[1]
        while (result[0] !== longestChains[0].between[1]) {
            // the next atom in the chain will be bonded the last added atom
            let candidates = result[0].bonds
            // the next atom will be one closer the the last added atom
            let distanceNeeded = result[0].distanceFrom(longestChains[0].between[1]) - 1
            // the atom with 0 distance from between[1] is between[1] itself, and the chain is complete
            if (distanceNeeded == 0) {
                result[0].unshift(longestChains[0].between[1])
                continue
            }
            for (let i = 0; i < candidates.length; i++) {
                if (candidates[i].distanceFrom(longestChains[0].between[1]) == distanceNeeded) {
                    result.unshift(candidates[i])
                    continue
                }
            }
        }
        return result
    }
}

let names = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec']

function nameParentChain(parentChain) {
    return names[parentChain.length - 1] + 'ane'
}