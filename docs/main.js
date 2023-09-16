const regexp = /\[[\w\/ -]+\]/g;
var explanationIndices = [];
var totalCount = 0;
var currentExplanationIndex = 0;
var explanationTemplate = '';
var queryParams = new URLSearchParams(window.location.search);
var explanationPath = queryParams.get("path") ? queryParams.get("path") : './data/cellphone/u-explanation.json';
var explanationDir = queryParams.get("dir") ? queryParams.get("dir") : './data/cellphone/u-explanations';
var itemDir = queryParams.get("itemDir") ? queryParams.get("itemDir") : './data/cellphone/items';
var explanationIdx = document.getElementById('explanation-id');

var selectData = (name, dataPath, dataDir, newItemDir) => {
    explanationPath = dataPath;
    explanationDir = dataDir;
    itemDir = newItemDir;
    document.getElementById('data-selection').innerText = name;
    renderExplanation();
}

var updateFormValue = () => {
    explanationIdx.value = window.location.href;
}

var placeholder = () => {
    var recommended = {
        title: "recommended item",
        imUrl: "./data/placeholder-image.png",
    };
    var reference = {
        title: "reference item",
        imUrl: "./data/placeholder-image.png",
    };
    var aspect = "";
    var explanation = {
        "explanation": "Loading...",
    };
    document.getElementById("explanation").innerHTML = eval('`' + explanationTemplate + '`');
}


var postCorrection = (explanationText) => {
    const matches = [...explanationText.matchAll(regexp)];
    if (matches[2][0] === matches[4][0]) {
        explanationText = explanationText.replace(/is (better|worse) than/, "is similar to");
    }
    return explanationText;
}

var displayExplanation = (idx) => {
    placeholder();
    fetch(`${explanationDir}/${explanationIndices[idx]}`)
        .then((response) => response.json())
        .then((explanation) => {
            var skipAspects = localStorage.getItem('skipAspects');
            var recommended = {};
            var reference = {};
            for (let index = 0; index < explanation['explanation'].length; index++) {
                explanation['explanation'][index] = postCorrection(explanation['explanation'][index]);
                const matches = [...explanation['explanation'][index].matchAll(regexp)];
                if (skipAspects && skipAspects.length > 0 && skipAspects.includes(matches[1][0].replace("[", "").replace("]", ""))) {
                    nextExplanation();
                    return;
                }
            }
            fetch(`${itemDir}/${explanation['iid']}`)
                .then((response) => response.json())
                .then((item) => {
                    recommended = item;
                    fetch(`${itemDir}/${explanation['jid']}`)
                        .then((response) => response.json())
                        .then((item) => {
                            reference = item;
                            document.getElementById("explanation").innerHTML = eval('`' + explanationTemplate + '`');
                            queryParams.set('explanation', explanationIndices[idx]);
                            history.replaceState(null, null, "?" + queryParams.toString());
                            updateFormValue();
                        }).catch((error) => {
                            document.getElementById("explanation").innerHTML = eval('`' + explanationTemplate + '`');
                            queryParams.set('explanation', explanationIndices[idx]);
                            history.replaceState(null, null, "?" + queryParams.toString());
                            updateFormValue();
                        });
                })
                .catch((error) => {
                    document.getElementById("explanation").innerHTML = eval('`' + explanationTemplate + '`');
                    queryParams.set('explanation', explanationIndices[idx]);
                    history.replaceState(null, null, "?" + queryParams.toString());
                    updateFormValue();
                });
        }).catch((error) => {
            console.log(error);
        });
}

var prevExplanation = () => {
    if (currentExplanationIndex > 0) {
        currentExplanationIndex -= 1;
        displayExplanation(currentExplanationIndex);
    }
}

var nextExplanation = () => {
    if (currentExplanationIndex < totalCount - 1) {
        currentExplanationIndex += 1;
        displayExplanation(currentExplanationIndex);
    }
}

var renderExplanation = () => {
    queryParams.set('dir', explanationDir);
    queryParams.set('path', explanationPath);
    queryParams.set('itemDir', itemDir);
    history.replaceState(null, null, "?" + queryParams.toString());
    fetch(explanationPath)
        .then((response) => response.json())
        .then((json) => {
            explanationIndices = json;
            totalCount = explanationIndices.length;
            var explanationQuery = queryParams.get('explanation');
            if (explanationQuery) {
                var explanationIndex = explanationIndices.indexOf(explanationQuery);
                if (explanationIndex > -1) {
                    currentExplanationIndex = explanationIndex
                    updateFormValue();
                }
            }
            displayExplanation(currentExplanationIndex);
        });

}

fetch(`./data/template.html`)
    .then((response) => response.text())
    .then((template) => {
        explanationTemplate = template;
        placeholder();
        renderExplanation();
    });


var toastNotifier = document.getElementById('liveToast');
var toast = new bootstrap.Toast(toastNotifier);


window.addEventListener("load", function () {
    const form = document.getElementById('record-explanation-form');
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = new FormData(form);
        const action = e.target.action;
        fetch(action, {
            method: 'POST',
            body: data,
        }).then(() => {
            const savedValue = Object.fromEntries(data)['explanation'];
            document.getElementById('liveToastText').innerText = decodeURIComponent(savedValue.split('=').at(-1)) + ' is saved!';
            toast.show();
        });
    });
});


var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
