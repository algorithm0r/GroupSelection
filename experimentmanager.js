var DEFAULT_PARAMS = {
    maxBreed: 8,
    maxShare: 8,
    mutStep: 64,
    mutRate: 0.05,
    popDenominator: 500,
    popMin: 500,
    popMultiplier: 0.1,
    popStart: 100,
    sharePercentModifier: 0.1,
    breedClosest: true,
    shareWithSelfish: false,
    uniformForage: false,
    mutateRanges: false,

    graphDays: 200,
    viewAgentSize: 24,
    viewCountX: 30,
    viewCountY: 30,
    clockStep: 0.1,
    skipClock: true,

    maxDays: 10000,
    runName: "gs-default",
    sendToDB: true,
    download: true,
    sampleDays: 50,
    storeAll: false,

    pause: false
}

function ExperimentManager() {
    this.run = 0;
    this.maxRuns = 2; //max runs per test
    this.currentTest = 0;
    this.dataGroup = "DUMMY-DATA";

    //copy the default as test base for each test to run
    var tests = [];
    for(var i = 0; i < 4; i++) {
        tests.push(Object.assign({}, DEFAULT_PARAMS));
    }

    //test[0] is default

    tests[1].runName = "highBreedShare"
    tests[1].maxBreed = 64;
    tests[1].maxShare = 64;

    tests[2].runName = "highShare"
    tests[2].maxBreed = 8;
    tests[2].maxShare = 64;

    tests[3].runName = "highBreed"
    tests[3].maxBreed = 64;
    tests[3].maxShare = 8;

    //keep tests as an empty array if you want to play around with settings in UI
    this.tests = tests;
    this.updateUI(DEFAULT_PARAMS);

}

ExperimentManager.prototype.nextParams = function () {
    var newParams;
    if(this.tests.length == 0) {
        newParams = this.getFromUI();
    } else {
        this.currentTest = this.run % this.tests.length;
        newParams = this.tests[this.currentTest];

        if(this.run >= (this.maxRuns * this.tests.length) + 1 ) {
            newParams.pause = true;
        }
    }

    this.run++;
    this.updateUI(newParams);
    return newParams;
};

ExperimentManager.prototype.nextPopId = function () {
    var id = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        id += possible.charAt(Math.floor(Math.random() * possible.length));

    document.getElementById('popId').value = id;
    return id;
};

ExperimentManager.prototype.getFromUI = function () {
    var params = {
        mutRate: parseFloat(document.getElementById('mutRate').value),
        mutStep:  parseInt(document.getElementById('mutStep').value),
        viewCountX: parseInt(document.getElementById('viewCountX').value),
        viewCountY: parseInt(document.getElementById('viewCountY').value),
        viewAgentSize: parseInt(document.getElementById('viewAgentSize').value),
        maxBreed: parseInt(document.getElementById('maxBreed').value),
        maxShare: parseInt(document.getElementById('maxShare').value),
        sharePercentModifier: parseFloat(document.getElementById('sharePercentModifier').value),
        popStart: parseInt(document.getElementById('popStart').value),
        popMin: parseInt(document.getElementById('popMin').value),
        popMultiplier: parseFloat(document.getElementById('popMultiplier').value),
        popDenominator: parseInt(document.getElementById('popDenominator').value),
        skipClock: document.getElementById('skipClock').checked,
        clockStep: parseFloat(document.getElementById('clockStep').value),
        breedClosest: document.getElementById('breedClosest').checked,
        shareWithSelfish: document.getElementById('shareWithSelfish').checked,
        mutateRanges: document.getElementById('mutateRanges').checked,
        maxDays: parseInt(document.getElementById('maxDays').value),
        graphDays: parseInt(document.getElementById('graphDays').value),
        uniformForage: document.getElementById('uniformForage').checked,
        runName: document.getElementById('runName').value,
        sampleDays: parseInt(document.getElementById('sampleDays').value),
        download: document.getElementById('download').checked,
        storeAll: document.getElementById('storeAll').checked,
        sendToDB: document.getElementById('sendToDB').checked,
        pause: false
    };

    return params;
};

ExperimentManager.prototype.updateUI = function (p) {
    var disableControls = this.tests.length;
    document.getElementById("tests").innerHTML = "Test: " + (this.currentTest + 1) + "/" + this.tests.length;
    document.getElementById("runs").innerHTML = "Run: " + this.run + "/" + (this.tests.length * this.maxRuns);

    Object.keys(p).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object
        var element = document.getElementById(key);
        if(element) {
            if(element.type == "checkbox") {
                element.checked = p[key];
            } else {
                element.value = p[key];
            }
            element.disabled = disableControls;
        }
    });
}
