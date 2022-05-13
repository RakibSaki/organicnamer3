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
        this.terminalAtoms = terminalAtoms
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
        // record properties of chains
        for (let i = 0; i < longestChains.length; i++) {
            let chain = getChain(longestChains[i].between[0], longestChains[i].between[1])
            // position of branches, starting from 2 (terminal atom is 1)
            longestChains[i].branchesAt = []
            longestChains[i].branches = 0
            // record branch positions and numbers of branches
            for (let j = 0; j < chain.length; j++) {
                if (chain[j].bonds.length > 2) {
                    longestChains[i].branchesAt.push(j + 1)
                    longestChains[i].branches += chain[j].bonds.length - 2
                }
            }
            longestChains[i].chain = chain
            longestChains[i].closestBranchAt = longestChains[i].branchesAt[0]
        }
        console.log(longestChains[0].closestBranchAt)
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
    let parentChainName = names[parentChain.chain.length - 1] + 'ane'
    let prefix = nameBranches(parentChain.chain)
    return prefix + parentChainName
}

// return array of atoms from start to finish atom
function getChain(start, finish) {
    let result = []
    result.unshift(finish)
    for (let distanceNeeded = start.distanceFrom(finish) - 1; distanceNeeded > 0; distanceNeeded--) {
        for (let i = 0; i < result[0].bonds.length; i++) {
            if (start.distanceFrom(result[0].bonds[i]) == distanceNeeded) {
                result.unshift(result[0].bonds[i])
            }
        }
    }
    result.unshift(start)
    return result
}

let multipliers = ['', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca']

function nameBranches(chain, terminalAtomsAmong) {
    let branches = {}   // of the format {methyl: [2, 6], ethyl: [3] ...} {subbranchname: position}
    let branchNames = []
    // fillup branches map
    for (let i = 1; i < chain.length - 1; i++) {
        if (chain[i].bonds.length > 2) {
            for (let j = 0; j < chain[i].bonds.length; j++) {
                if (chain[i].bonds[j] != chain[i - 1] && chain[i].bonds[j] != chain[i + 1]) {
                    let subBranchName = nameBranch(chain[i], chain[i].bonds[j], terminalAtomsAmong)
                    if (!branches[subBranchName]) {
                        branches[subBranchName] = [i + 1]
                        branchNames.push(subBranchName)
                    } else {
                        branches[subBranchName].push(i + 1)
                    }
                }
            }
        }
    }
    if (branchNames.length == 0) {
        return ''
    }
    branchNames.sort()
    let prefix = ''
    for (let branchName of branchNames) {
        let positions = branches[branchName]
        if ('0123456789'.includes(branchName[0])) {
            branchName = '-' + branchName
        }
        prefix += `-${positions.join(',')}-${multipliers[positions.length - 1]}${branchName}`
    }
    // remove the first hyphen
    prefix = prefix.slice(1)
    console.log(prefix)
    return prefix
}

function nameBranch(from, start, terminalAtomsAmong) {
    if (start.bonds.length == 1) {
        return names[0] + 'yl'
    }
    let molecule = from.molecule
    let terminalAtoms = []
    if (!terminalAtomsAmong) {
        terminalAtomsAmong = molecule.terminalAtoms
    }
    for (let i = 0; i < terminalAtomsAmong.length; i++) {
        if (from.distanceFrom(terminalAtomsAmong[i]) > start.distanceFrom(terminalAtomsAmong[i])) {
            terminalAtoms.push(terminalAtomsAmong[i])
        }
    }
    if (start.bonds.length == 2) {
        let farthestTerminalAtom = terminalAtoms[0]
        let farthestDistance = start.distanceFrom(farthestTerminalAtom)
        for (let i = 1; i < terminalAtoms.length; i++) {
            let distance = start.distanceFrom(terminalAtoms[i])
            if (farthestDistance < distance) {
                farthestTerminalAtom = terminalAtoms[i]
                farthestDistance = distance
            }
        }
        let chain = getChain(start, farthestTerminalAtom)
        return nameBranches(chain, terminalAtoms) + names[farthestDistance] + 'yl'
    } else {
        for (let i = 0; i < terminalAtoms.length; i++) {
            for (let j = 0; j < terminalAtoms.length; j++) {

            }
        }
        return 'notprimarybranch'
    }

}