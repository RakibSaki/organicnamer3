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
        bondLine.style.zIndex = '-1'
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
        this.molecule.showName()
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
    showName() {
        for (let i = 0; i < this.atoms.length; i++) {
            this.atoms[i].element.innerHTML = ''
        }
        this.atoms[0].element.innerHTML = '\n' + nameParentChain(this.parentChain())
    }
    add(atom) {
        atom.molecule = this
        this.atoms.unshift(atom)
    }
    parentChain() {
        if (this.atoms.length == 1) {
            return {
                chain: [this.atoms[0]]
            }
        }
        let terminalAtoms = []
        // find terminal atoms
        for (let i = 0; i < this.atoms.length; i++) {
            if (this.atoms[i].bonds.length == 1) {
                terminalAtoms.push(this.atoms[i])
            }
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
        // if several longest chains, just choosing the first longest chain for now
        for (let i = 0; i < longestChains.length; i++) {
            let chain = [longestChains[i].between[0]]
            // position of branches, starting from 2 (terminal atom is 1)
            longestChains[i].branchesAt = []
            longestChains.branches = 0
            // keep adding atom to the chain from between[0] to between[1]
            for (let distanceNeeded = longestChains[i].length - 1; distanceNeeded >= 0; distanceNeeded--) {
                // the next atom in the chain will be bonded the last added atom
                let candidates = chain[0].bonds
                // the next atom will be one closer the the last added atom
                // so distanceNeeded is decreasing by one

                // the atom with 0 distance from between[1] is between[1] itself, and the chain is complete
                if (distanceNeeded == 0) {
                    chain.unshift(longestChains[i].between[1])
                    continue
                }
                for (let j = 0; j < candidates.length; j++) {
                    if (candidates[j].distanceFrom(longestChains[i].between[1]) == distanceNeeded) {
                        console.log('jound')
                        chain.unshift(candidates[j])
                        continue
                    }
                }
                // if selected candidate (new atom in chain) has branches, record branch position and number of branches
                if (chain[0].bonds.length > 2) {
                    longestChains[i].branchesAt.push(1 + longestChains[i].length - distanceNeeded)
                    longestChains[i].branches += chain[0].bonds.length - 2
                }
            }
            longestChains[i].chain = chain
            longestChains[i].closestBranchAt = longestChains[i].branchesAt[0]
            let closestFromOtherEnd = 2 + longestChains[i].length  - longestChains[i].branchesAt[longestChains[i].branchesAt.length - 1]
            if (closestFromOtherEnd < longestChains[i].closestBranchAt) {
                longestChains[i].closestBranchAt = closestFromOtherEnd
            }
        }
        let chainsToSelectIndex = [0]
        // find chain with most branches
        for (let i = 1; i < longestChains.length; i++) {
            // if found a chain with more branches, select that instead
            if (longestChains[i].branches > longestChains[chainsToSelectIndex[0]].branches) {
                chainsToSelectIndex = [i]
                continue
            }
            // if found another chain with same number of branches, add that to selection
            if (longestChains[i].branches == longestChains[chainsToSelectIndex[0]].branches) {
                chainsToSelectIndex.push(i)
            }
        }
        // if one chain exclusively has most branches, return that chain
        if (chainsToSelectIndex.length == 1) {
            return longestChains[chainsToSelectIndex[0]]
        }
        // else select chain with branches starting closest to a terminal atom
        for (let i = 1; i < chainsToSelectIndex.length; i++) {
            let chainToCheckAgainst = longestChains[chainsToSelectIndex[0]]
            let chainToCheck = longestChains[chainsToSelectIndex[i]]
            if (chainToCheck.closestBranchAt < chainToCheckAgainst.closestBranchAt) {
                chainsToSelectIndex[0] = i
            }
        }
        return longestChains[chainsToSelectIndex[0]]
    }
}

let names = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec']

function nameParentChain(parentChain) {
    console.log(parentChain)
    return names[parentChain.chain.length - 1] + 'ane'
}