let globalGameData = null;

document.getElementById('jsonFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            globalGameData = data.games;
            
            const gameKeys = Object.keys(globalGameData).sort();
            
            const successMsg = document.getElementById('successMsg');
            successMsg.innerText = `✨ Successfully processed ${gameKeys.length} games!`;

            const select = document.getElementById('gameSelect');
            select.innerHTML = ''; 
            gameKeys.forEach(gameName => {
                let opt = document.createElement('option');
                opt.value = gameName;
                opt.textContent = gameName;
                select.appendChild(opt);
            });

            document.getElementById('stage1').style.display = 'none';
            document.getElementById('stage2').style.display = 'flex';
            updateItemList(select.value);

        } catch (err) {
            alert("Oh dear! (Invalid JSON)");
        }
    };
    reader.readAsText(file);
});

document.getElementById('gameSelect').addEventListener('change', function(e) {
    updateItemList(e.target.value);
});

function updateItemList(gameName) {
    const listElement = document.getElementById('itemList');
    listElement.innerHTML = '';

    const items = globalGameData[gameName].item_name_to_id;
    
    Object.entries(items).forEach(([itemName, itemId]) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${itemName}</strong>: <code>${itemId}</code>`;
        listElement.appendChild(li);
    });
}

function convertToCamelCase(snakeCaseText) {
  return snakeCaseText.replace(/(_\w)/g, (match) => {
    return match[1].toUpperCase();
  })
}

function generateTSContent() {
    const selectedGame = document.getElementById('gameSelect').value;
    const shortName = document.getElementById('shortName').value || "game";
    const itemData = globalGameData[selectedGame].item_name_to_id;

    return `import { IconMatcher } from '../../types/icon-types.js'

export const ${convertToCamelCase(shortName)}Icons: IconMatcher[] = [
${Object.keys(itemData).map(itemName => `  { pattern: ['${itemName}'], emoji: '${shortName}_' },`).join('\n')}
]
`
}

function updatePreview() {
    const previewElement = document.getElementById('codePreview');
    if (globalGameData) {
        previewElement.textContent = generateTSContent();
    }
}

document.getElementById('gameSelect').addEventListener('change', () => {
    updateItemList(document.getElementById('gameSelect').value);
    updatePreview();
});

document.getElementById('shortName').addEventListener('input', updatePreview);

document.getElementById('exportForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const tsContent = generateTSContent()
    const shortName = document.getElementById('shortName').value || "game";
    downloadFile(`${convertToCamelCase(shortName)}.ts`, tsContent);
});

function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}