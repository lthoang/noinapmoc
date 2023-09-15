var explanationIndices = [];
var totalCount = 0;
var currentExplanationIndex = 0;
var explanationTemplate = '<div class="row"><div class="col-5"><figure style="text-align: center"><h5>Recommendation product: <a href="https://www.amazon.com/dp/${recommended}">${recommended}</a></h5><figcaption>${recommendedTitle}</figcaption><a href="https://www.amazon.com/dp/${recommended}" target="_blank" tooltip="Click to view product page"><img src="${recommendedImg}"style="margin-bottom: 1rem; max-width: 50%;" alt=""></a></figure></div><div class="col-2"></div><div class="col-5"><figure style="text-align: center"><h5>Reference Item: <a href="https://www.amazon.com/dp/${reference}">${reference}</a></h5><figcaption>${referenceTitle}</figcaption><a href="https://www.amazon.com/dp/${reference}" target="_blank" tooltip="Click to view product page"><img src="${referenceImg}"style="margin-bottom: 1rem; max-width: 50%;" alt=""></a></figure></div></div><div class="row"><div class="col" style="text-align: center"><h4>Explanation</h4><p>${explanationText}</p></div></div>';

var displayExplanation = (idx) => {
    fetch(`./data/explanations/${explanationIndices[idx]}`).then((response) => response.json()).then((json) => {
        var explanation = json;
        var userItemAspect = explanationIndices[idx].split(",");
        var user = userItemAspect[0];
        var recommended = userItemAspect[1];
        var aspect = userItemAspect[2];
        
        var explanationText = explanation["explanation"];
        var reference = explanation["jid"];
        fetch(`./data/items/${recommended}`).then((response) => response.json()).then((item) => {
            var recommendedTitle = item["title"];
            var recommendedImg = item["imUrl"];
            fetch(`./data/items/${reference}`).then((response) => response.json()).then((item) => {
                var referenceTitle = item["title"];
                var referenceImg = item["imUrl"];
                document.getElementById("explanation").innerHTML = eval('`' + explanationTemplate + '`');
            });
        });
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

fetch('./data/explanation.json').then((response) => response.json()).then((json) => {
    explanationIndices = json;
    totalCount = explanationIndices.length;
    displayExplanation(currentExplanationIndex);
});