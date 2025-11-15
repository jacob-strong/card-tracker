import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://card-tracker-6d5e6-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const collectionDB = getDatabase(app)
const cardDBList = ref(collectionDB, "cards")

const inputField = document.getElementById("input-field")
const addButton = document.getElementById("add-button")
const collectionList = document.getElementById("collection-list")

addButton.addEventListener("click", function() {
    let inputValue = inputField.value

    push(cardDBList, inputValue)
    console.log(`${inputValue} added to database`)
    clearInputField(inputValue)
})

onValue(cardDBList, function(snapshot) {
    let cardsArray = Object.entries(snapshot.val())

    clearCollectionList()
    for (let i = 0; i<cardsArray.length; i++){
        console.log(cardsArray[i])

        let currentCard = cardsArray[i]
        let cardID = currentCard[0]
        let cardName = currentCard[1]

        addToCollectionList(currentCard)
    }
})

function clearCollectionList(){
    collectionList.innerHTML = ""
}

function clearInputField() {
    inputField.value = ""
}

function addToCollectionList(inputValue) {
    let cardID = inputValue[0]
    let cardName = inputValue[1]

    let newListItem = document.createElement("li")
    newListItem.textContent = cardName

    // Edit button
    let editButton = document.createElement("button")
    editButton.textContent = "Edit"
    editButton.addEventListener("click", function() {
        console.log(`Edit clicked for ${cardName}`)
        let exactLocation = ref(collectionDB, `cards/${cardID}`)
        let newName = prompt(`Edit card name:`, cardName)
        if (newName && newName.trim() !== "") {
            set(exactLocation, newName)
        }
    })
    
    // Delete button
    let deleteButton = document.createElement("button")
    deleteButton.textContent = "Delete"
    deleteButton.addEventListener("click", function() {
        let exactLocation = ref(collectionDB, `cards/${cardID}`)
        remove(exactLocation)
    })
    
    newListItem.append(editButton, deleteButton)
    collectionList.append(newListItem)
}