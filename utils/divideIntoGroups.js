const divideIntoGroups = (groupAmount, users) => {
    const shuffledUsers = shuffle(users)
    let groups = []

    //init groups
    for (let i = 0; i < groupAmount; i++) {
        groups[i] = []
    }

    //assign users into groups
    let whichGroup = 0

    for (let j = 0; j < users.length; j++) {
        whichGroup = whichGroup > groupAmount-1 ? 0 : whichGroup
        let group = groups[whichGroup].concat(users[j])
        groups[whichGroup] = group
        whichGroup++
    }
    return groups
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }

    return array
}

module.exports = divideIntoGroups