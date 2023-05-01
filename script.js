var inventory = [];

var summonsDone = 0;
var currencyUsed = 0;
var pityCount = 0;

var summoned = [];

document.addEventListener("DOMContentLoaded", function() {
    var buttons = document.querySelectorAll(".toggle-button");
    for (var i = 0; i < buttons.length; i++) {
        toggle(buttons[i]);
    }
});

// Menu and side panel
function openPanel() {
    document.getElementById("sidepanel").style.width = "250px";
}

function closePanel() {
    document.getElementById("sidepanel").style.width = "0";
}

function toggle(button) {
    var content = button.parentNode.nextElementSibling;
    content.style.display = content.style.display === "none" ? "block" : "none";
    button.textContent = content.style.display === "none" ? "+" : "-";
    button.classList.toggle("active");
}

function deleteParent(button) {
    var parentDiv = button.parentNode;
    parentDiv.parentNode.removeChild(parentDiv);
}

function addRarity(button) {
    var newDiv = document.createElement("div");
    newDiv.classList.add("new-content");
    newDiv.innerHTML = 
    "<input class='rarity-input rarity-name' placeholder='Name'>" + 
    "<input class='rarity-input rarity-chance' placeholder='Chance'>" + 
    "<p>%</p>" + 
    "<button class='delete-button' onclick='deleteParent(this)'>Delete</button>";
    button.parentNode.insertBefore(newDiv, button);
}

function addUnit(button) {
    var newDiv = document.createElement("div");
    newDiv.classList.add("new-content");
    
    // create name input
    var nameInput = document.createElement("input");
    nameInput.classList.add("unit-input", "unit-name");
    nameInput.setAttribute("placeholder", "Name");
    newDiv.appendChild(nameInput);

    // create rarity dropdown
    newDiv.innerHTML += "<select class='unit-input unit-rarity' onfocus=refreshRarities(this)></select>"
  
    // create chance input
    var chanceInput = document.createElement("input");
    chanceInput.classList.add("unit-input", "unit-chance");
    chanceInput.setAttribute("placeholder", "Chance");
    newDiv.appendChild(chanceInput);

    newDiv.innerHTML +=  "<p>%</p>";
  
    // create delete button
    var deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("onclick","deleteParent(this)");
    newDiv.appendChild(deleteButton);
  
    button.parentNode.insertBefore(newDiv, button);
}

function singleSummon() {
    summoned = [];
    var currency = document.getElementById("currency");
    var cost = document.getElementById("summon-cost");
    var difference = currency.value - cost.value;
    if (difference >= 0) {
        var obtained = rollForUnit()
        if (obtained != null) {
            addToBox(obtained)
            summoned.push(obtained);
        }

        summonsDone += 1;
        currencyUsed += parseFloat(cost.value);
        updateStats();
        updateScreen();

        currency.value = difference;
    }
    else {
        console.log("Not enough currency");
    }
}

function multiSummon() {
    summoned = [];
    var currency = document.getElementById("currency");
    var cost = document.getElementById("summon-cost");
    var amount = document.getElementById("summon-amount")
    var difference = currency.value - (cost.value*amount.value);
    if (difference >= 0) {
        for (var i = 0; i < amount.value; i++) {
            var obtained = rollForUnit()
            if (obtained != null) {
                addToBox(obtained)
                summoned.push(obtained);
            }
        }

        summonsDone += parseFloat(amount.value);
        currencyUsed += parseFloat(cost.value*amount.value);
        updateStats();
        updateScreen();

        currency.value = difference;
    }
    else {
        console.log("Not enough currency")
    }
}

function rollForUnit() {
    // get all unit data
    var unitData = [];
    var unitNames = document.querySelectorAll(".unit-name");
    var unitRarities = document.querySelectorAll(".unit-rarity");
    var unitChances = document.querySelectorAll(".unit-chance");
    for (var i = 0; i < unitNames.length; i++) {
        var name = unitNames[i].value;
        var rarity = unitRarities[i].value;
        var chance = unitChances[i].value;
        if (isNaN(parseFloat(chance))) {
            chance = 0;
        }
        unitData.push({
            name: name,
            rarity: rarity,
            chance: chance
        });
    }

    // get all rarity data
    var rarityData = [];
    var rarityNames = document.querySelectorAll(".rarity-name");
    var rarityChances = document.querySelectorAll(".rarity-chance");
    for (var i = 0; i < rarityNames.length; i++) {
        var name = rarityNames[i].value;
        var chance = rarityChances[i].value;
        if (isNaN(parseFloat(chance))) {
            chance = 0;
        }
        rarityData.push({
            name: name,
            chance: chance
        });
    }


    var pitySelector = document.getElementById("pity-selector");
    var selectedRarityIndex = pitySelector.selectedIndex;
    var hardPity = document.getElementById("hardPity-amount").value;
    if (hardPity === '') {
        hardPity = Infinity;
    }
    var pityCheckbox = document.getElementById("hardPity-checkbox");
    
    if (pityCheckbox.checked === true) {
        pityCount += 1;
    }

    if (pityCount >= hardPity && selectedRarityIndex != -1) {
        pityCount = 0;

        var rarityIndex = selectedRarityIndex;

    } else {
        // pick rarity based on chance
        var randomRarity = Math.random() * 100;
        var currentRarityChance = 0;
        var rarityIndex = -1;
        for (var i = 0; i < rarityData.length; i++) {
            currentRarityChance += parseFloat(rarityData[i].chance)
            if (currentRarityChance > randomRarity) {
                rarityIndex = i;
                break;
            }

        }
    }

    if (rarityIndex != -1) {
        if (selectedRarityIndex === rarityIndex) {
            pityCount = 0;
        }

        // get all units of the chosen rarity
        var unitsOfRarity = unitData.filter(function(unit) {
            return unit.rarity === rarityData[rarityIndex].name;
        });

        // pick unit based on chance
        var randomUnit = Math.random() * 100;
        var currentUnitChance = 0;
        var unitIndex = -1;
        for (var i = 0; i < unitsOfRarity.length; i++) {
            currentUnitChance += parseFloat(unitsOfRarity[i].chance)
            if (currentUnitChance > randomUnit) {
                unitIndex = i;
                break;
            }
        }

        if (unitIndex != -1) {
            // add unit to unit box
            var obtained = unitsOfRarity[unitIndex];
            return obtained;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function addToBox(unit) {
    var dupe = false;
    for (let units of inventory) {
        if (units.name === unit.name && units.rarity === unit.rarity) {
            units.amount += 1;
            dupe = true;
        }
    }
    if (dupe === false) {
        inventory.push({
            name: unit.name,
            rarity: unit.rarity,
            amount: 1
        });
    }

    updateBox()
}

// Function to refresh the box
function updateBox() {
    var box = document.getElementById("unit-box");
    box.innerHTML = '';

    var rarityNames = document.querySelectorAll(".rarity-name");
    for (var i = 0; i < rarityNames.length; i++) {
        var newDiv = document.createElement("div");
        newDiv.classList.add("new-content");
        newDiv.innerHTML = "<p class='box-title'>"+rarityNames[i].value+"</p>";
        for (let units of inventory) {
            if (units.rarity === rarityNames[i].value) {
                newDiv.innerHTML += "<p class='box-units'>"+units.name+" x"+units.amount+"</p>";
            }
        }
        box.appendChild(newDiv);
    }
}

// Function to refresh the statistics box
function updateStats() {
    let summonText = document.getElementById("stats-summon");
    let currencyText = document.getElementById("stats-currency");
    let pityText = document.getElementById("stats-pity");
    let rarityText = document.getElementById("stats-rarity");

    summonText.innerText = "Summons: "+summonsDone;
    currencyText.innerText = "Currency Used: "+currencyUsed;
    pityText.innerText = "Pity Count: "+pityCount;

    rarityText.innerHTML = 'Rarities Pulled:';
    var rarityNames = document.querySelectorAll(".rarity-name");
    for (var i = 0; i < rarityNames.length; i++) {
        var newDiv = document.createElement("div");

        var amount = 0;
        for (let units of inventory) {
            if (units.rarity === rarityNames[i].value) {
                amount += units.amount;
            }
        }
        newDiv.innerHTML = "<p>"+rarityNames[i].value+": "+amount+"</p>"
        rarityText.appendChild(newDiv);
    }
}

function refreshRarities(dropdown) {
    dropdown.innerHTML = '';

    // get all rarity names from the rarity box
    var rarityNames = [];
    var rarities = document.querySelectorAll(".rarity-name");
    for (var i = 0; i < rarities.length; i++) {
      rarityNames.push(rarities[i].value);
    }
  
    // add rarity options to dropdown
    for (var i = 0; i < rarityNames.length; i++) {
      var option = document.createElement("option");
      option.text = rarityNames[i];
      dropdown.add(option);
    }
}

function resetSummons() {
    inventory = [];
    summonsDone = 0;
    currencyUsed = 0;
    pityCount = 0;

    updateStats();
    updateBox();
}

function resetPity() {
    pityCount = 0;
    updateStats();
}

function updateScreen() {
    var screen = document.getElementById("summon-screen");

    var summonText = "";

    for (var i = 0; i < summoned.length; i++) {
        summonText += summoned[i].name + ", ";
    }

    summonText = summonText.slice(0, -2);

    if (summonText === "") {
        summonText = "Nothing";
    }

    screen.innerHTML = 
    "<p>You got:</p>" +
    "<p>"+summonText+"</p";
}

function exportSettings() {
    var fileName = "Settings.txt";


    // Get data
    var final = "Rarities"+"\n";
    // get all rarity data
    var rarityNames = document.querySelectorAll(".rarity-name");
    var rarityChances = document.querySelectorAll(".rarity-chance");
    for (var i = 0; i < rarityNames.length; i++) {
        var name = rarityNames[i].value;
        var chance = rarityChances[i].value;
        final += name+":"+chance+"\n";
    }
    
    final += "Units"+"\n";
    // get all unit data
    var unitNames = document.querySelectorAll(".unit-name");
    var unitRarities = document.querySelectorAll(".unit-rarity");
    var unitChances = document.querySelectorAll(".unit-chance");
    for (var i = 0; i < unitNames.length; i++) {
        var name = unitNames[i].value;
        var rarity = unitRarities[i].value;
        var chance = unitChances[i].value;
        final += name+":"+rarity+":"+chance+"\n";
    }

    final += "Pity"+"\n";
    // Get customization options data
    var selectedPity = "";
    var pitySelector = document.getElementById("pity-selector");
    var selectedRarityIndex = pitySelector.selectedIndex;
    if (selectedRarityIndex != -1) {
        selectedPity = pitySelector.options[selectedRarityIndex].text;
    }
    var pityAmount = document.getElementById("hardPity-amount").value;
    var pityCheckbox = document.getElementById("hardPity-checkbox").checked;

    final += selectedPity+":"+pityAmount+":"+pityCheckbox+"\n";
    // End of getting data

    // Write to file and download
    var fileContent = final;
    var myFile = new Blob([fileContent], {type: "text/plain"});
    window.URL = window.URL || window.webkitURL;
    var temp = document.createElement("a");
    temp.setAttribute("href", window.URL.createObjectURL(myFile));
    temp.setAttribute("download", fileName);
    temp.click();
    temp.remove();
}

function importSettings() {
    const file = document.getElementById("import").files[0];

    const reader = new FileReader();

    reader.onload = function(event) {
        const text = this.result;

        var lines = text.split('\n');

        var i = 1;

        // Create and append the elements for each line
        var rarityBox = document.getElementById("rarity-box");
        rarityBox.innerHTML = '<button class="add-button" id="add-rarity" onclick="addRarity(this)">+</button>';
        var addRarityButton = document.getElementById("add-rarity");
        while (lines[i] != "Units" && lines[i] != undefined && lines[i] != "") {
            var sections = lines[i].split(":");
            var newDiv = document.createElement("div");
            newDiv.classList.add("new-content");

            var rarityInput = document.createElement("input");
            rarityInput.classList.add("rarity-input", "rarity-name");
            rarityInput.setAttribute("placeholder", "Name");
            rarityInput.value = sections[0];
            newDiv.appendChild(rarityInput);

            var rarityChance = document.createElement("input");
            rarityChance.classList.add("rarity-input", "rarity-chance");
            rarityChance.setAttribute("placeholder", "Chance");
            rarityChance.value = sections[1];
            newDiv.appendChild(rarityChance);

            var percentSymbol = document.createElement("p");
            percentSymbol.textContent = "%";
            newDiv.appendChild(percentSymbol);

            var deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button")
            deleteButton.setAttribute("onclick","deleteParent(this)");
            deleteButton.textContent = "Delete";
            newDiv.appendChild(deleteButton);

            addRarityButton.parentNode.insertBefore(newDiv, addRarityButton);
            i++;
        }
        i++;

        // Units / Items import
        var unitItemsBox = document.getElementById("unit-items-box");
        unitItemsBox.innerHTML = '<button class="add-button" id="add-unit" onclick="addUnit(this)">+</button>';
        var addUnitButton = document.getElementById("add-unit");
        while (lines[i] != "Pity" && lines[i] != undefined && lines[i] != "") {
            var sections = lines[i].split(":");
            var unitName = sections[0];
            var unitRarity = sections[1];
            var unitChance = sections[2];

            var newDiv = document.createElement("div");
            newDiv.classList.add("new-content");
            
            // create name input
            var nameInput = document.createElement("input");
            nameInput.classList.add("unit-input", "unit-name");
            nameInput.setAttribute("placeholder", "Name");
            nameInput.value = unitName;
            newDiv.appendChild(nameInput);

            // create rarity dropdown
            var dropDown = document.createElement("select");
            var option = document.createElement("option");
            option.textContent = unitRarity;
            dropDown.appendChild(option);
            dropDown.classList.add("unit-input", "unit-rarity");
            dropDown.setAttribute("onfocus","refreshRarities(this)");
            newDiv.appendChild(dropDown);
        
            // create chance input
            var chanceInput = document.createElement("input");
            chanceInput.classList.add("unit-input", "unit-chance");
            chanceInput.setAttribute("placeholder", "Chance");
            chanceInput.value = unitChance;
            newDiv.appendChild(chanceInput);

            var percentSymbol = document.createElement("p");
            percentSymbol.textContent = "%";
            newDiv.appendChild(percentSymbol);
        
            // create delete button
            var deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("onclick","deleteParent(this)");
            newDiv.appendChild(deleteButton);
        
            addUnitButton.parentNode.insertBefore(newDiv, addUnitButton);
            i++;
        }
        i++;
        while (lines[i] != undefined && lines[i] != "") {
            var sections = lines[i].split(":");
            var pityRarity = sections[0];
            var pityChance = sections[1];
            var pityActive = sections[2];

            var pitySelector = document.getElementById("pity-selector");
            var hardPity = document.getElementById("hardPity-amount");
            var pityCheckbox = document.getElementById("hardPity-checkbox");
            
            var option = document.createElement("option");
            option.textContent = pityRarity;
            pitySelector.appendChild(option);

            hardPity.value = pityChance;
            if (pityActive === "true") {
                pityCheckbox.checked = true;
            }
            else {
                false;
            }

            i++;
        }
    };

    if (file) {
        reader.readAsText(file);
    }
}