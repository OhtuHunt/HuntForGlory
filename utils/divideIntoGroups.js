const divideIntoGroups = (groupAmount, users) => {

    const shuffledUsers = shuffle(users)
    const groupSizeMax = Math.ceil(users.length / groupAmount)
    const groupSizeMin = Math.floor(users.length / groupAmount)

    let groups = []
    let isBreak = false

    for (let i = 0; i < groupAmount; i++) {
        let groupNow = []
        for (let j = i * groupSize; j < i * groupSize + groupSize; j++) {
            if (!shuffledUsers[j]) {
                isBreak = true
                break
            }
            groupNow = groupNow.concat(shuffledUsers[j])
        }
        if (isBreak) {
            break
        }
        groups.push(groupNow)
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