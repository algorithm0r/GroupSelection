// GameBoard code below


function Agent(game, x, y, params, mother, father) {
    this.color = { h: 0, s: 0, l: 50 };
    if (mother && father) {
        // crossover
        //var trit = randomInt(3);
        //if (trit === 0) {
        //    this.color = mother.color;
        //} else if (trit === 1) {
        //    this.color = father.color;
        //}
        //else {
        //    this.color.r = Math.floor((mother.color.r + father.color.r) / 2);
        //    this.color.g = Math.floor((mother.color.g + father.color.g) / 2);
        //    this.color.b = Math.floor((mother.color.r + father.color.b) / 2);
        //}

        // sexual reproduction
        this.color.h = geneticMut(mother.color.h, father.color.h);
        this.color.s = geneticMut(mother.color.s, father.color.s);
        if(params.mutateRanges) {
            this.breedRange = geneticMut(mother.breedRange, father.breedRange);
            this.shareRange = geneticMut(mother.shareRange, father.shareRange);
        } else {
            this.breedRange = params.maxBreed;
            this.shareRange = params.maxShare;
        }

        var trit = randomInt(3);
        if (trit === 0) {
            this.sharePercent = mother.sharePercent;
        } else if (trit === 1) {
            this.sharePercent = father.sharePercent;
        } else {
            this.sharePercent = (mother.sharePercent + father.sharePercent) / 2;
        }

        // mutation
        this.color.h = randomMut(this.color.h, params.mutStep, 360, params.mutRate);
        this.color.s = randomMut(this.color.s, params.mutStep, 100, params.mutRate);

        if(params.mutateRanges) {
            this.breedRange = randomMut(this.breedRange, params.mutStep, params.maxBreed, params.mutRate);
            this.shareRange = randomMut(this.shareRange, params.mutStep, params.maxShare, params.mutRate);
        }

        if (Math.random() < params.mutRate) {
            //this.sharePercent = randomInt(2);
            if (randomInt(2)) {
                this.sharePercent += Math.random()*params.sharePercentModifier;
            } else {
                this.sharePercent -= Math.random()*params.sharePercentModifier;
            }
            if (this.sharePercent < 0) this.sharePercent = 0;
            if (this.sharePercent > 1) this.sharePercent = 1;
        }
    }
    else {
        this.color = {
            h: randomInt(360),
            s: randomInt(100),
            l: 50
        };

        if(params.mutateRanges) {
            this.breedRange = randomInt(params.maxBreed);
            this.shareRange = randomInt(params.maxShare);
        } else {
            this.breedRange = params.maxBreed;
            this.shareRange = params.maxShare;
        }

        this.sharePercent = 0;
    }

    this.food = 0;

    Entity.call(this, game, x, y);
}

Agent.prototype = new Entity();
Agent.prototype.constructor = Agent;

Agent.prototype.difference = function (agent) {
    var h = Math.abs(agent.color.h - this.color.h);
    var s = Math.abs(agent.color.s - this.color.s);
    return Math.sqrt(h*h + s*s);
}

function Population(game, params, id, dataGroup) {
    this.id = id;
    this.dataGroup = dataGroup;
    this.params = params;
    this.agents = [];
    this.elapsed = 0;
    this.toggle = false;
    this.popHistory = [];
    this.sharePercMinHistory = [];
    this.sharePercAvgHistory = [];
    this.sharePercMedHistory = [];
    this.sharePercStdHistory = [];
    this.sharePercMaxHistory = [];
    this.sharePercStdUpper = [];
    this.sharePercStdLower = [];
    this.breedAvgHistory = [];
    this.shareAvgHistory = [];
    this.shareMax = 0;
    this.completeHistory = [];
    this.popMax = 0;
    this.day = 0;

    for (var i = 0; i < this.params.popStart; i++) {
        this.agents.push(new Agent(game, 0, 0, this.params));
    }

    console.log("New Population: " + this.id);
    Entity.call(this, game, 0, 0);
};

Population.prototype = new Entity();
Population.prototype.constructor = Population;

Population.prototype.forage = function(){
    var val;
    if(this.params.uniformForage) {
        val = Math.random() * 2;
    } else {
        var val = (Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random())/4;
    }
    return val;
}

Population.prototype.update = function () {
    if(!this.params.pause) {

        //wait for clock if enabled
        var advance = this.params.skipClock;
        this.elapsed += this.game.clockTick;
        if (this.elapsed > this.params.clockStep) {
            advance = true;
            this.elapsed -= this.params.clockStep;
        }

        //limit to max number of generations
        if(this.day > this.params.maxDays  || this.agents.length === 0) {
            console.log("Simulation complete after " + this.day + "/" + this.params.maxDays + " days");

            if(socket && this.params.sendToDB) {
                var runStats = {
                    dataGroup: this.dataGroup,
                    popId: this.id,
                    params: this.params,
                    popCount: this.popHistory,
                    sharePercentsAvg: this.sharePercAvgHistory,
                    sharePercentsMin: this.sharePercMinHistory,
                    sharePercentsMax: this.sharePercMaxHistory,
                    sharePercentsStd: this.sharePercStdHistory,
                    sharePercentsMed: this.sharePercMedHistory,
                    breedAvg: this.breedAvgHistory,
                    shareAvg: this.shareAvgHistory
                }
                socket.emit("saveGS", runStats);
                console.log("Sent to DB");
            }

            if(this.params.download) {
                var filename = this.params.runName + "-" + this.id;

                download(filename + "-stats.csv", this.serialize(1));
                download(filename + "-params.json", JSON.stringify(this.params));

                if(this.params.sampleDays > 1) {
                    download(filename + "-sample.csv", this.serialize(this.params.sampleDays));
                }

                if(this.params.storeAll) {
                    var dto = {completeHistory: this.completeHistory};
                    download(filename + "-all.json", JSON.stringify(dto));
                }
            }
            console.log("Creating new population");

            this.removeFromWorld = true;
            newPopulation();
        }

        // feed
        if (advance) {
            if (!this.toggle) {
                this.day++;
                for (var i = 0; i < this.agents.length; i++) {
                    var agent = this.agents[i];
                    agent.food = this.forage();
                }
                // share
                for (var i = 0; i < this.agents.length; i++) {
                    var partners = [];
                    var agent = this.agents[i];
                    if (agent.sharePercent > 0) {
                        for (var j = 0; j < this.agents.length; j++) {
                            if (i !== j) {
                                var other = this.agents[j];
                                if ((other.sharePercent > 0 || this.params.shareWithSelfish) && agent.difference(other) < agent.shareRange) {
                                    partners.push(other);
                                }
                            }
                        }

                        for (var j = 0; j < partners.length; j++) {
                            partners[j].food += agent.sharePercent * agent.food / partners.length * this.params.publicGoods;
                        }
                        agent.food -= agent.sharePercent * agent.food;
                    }
                }
            } else {
                // breed
                var breeders = [];
                var offspring = [];
                for (var i = 0; i < this.agents.length; i++) {
                    var agent = this.agents[i];
                    if (agent.food > 1) {
                        breeders.push(agent);
                    }
                    agent.food = 0;
                }

                for (var i = 0; i < breeders.length; i++) {
                    var agent = breeders[i];
                    var bred = false;
                    var partner = null;
                    var partners = [];
                    var diff = Number.MAX_SAFE_INTEGER;

                    for (var j = 0; j < breeders.length; j++) {
                        if (i !== j) {
                            var other = breeders[j];
                            if (agent.difference(other) < agent.breedRange && agent.difference(other) < other.breedRange) {
                                partners.push(other);
                                if (agent.difference(other) < diff) {
                                    partner = other;
                                    diff = agent.difference(other);
                                }
                            }
                        }
                    }
                    if (!partner) {
                        //asexual
                        var newAgent = new Agent(this.game, 0, 0, this.params, agent, agent);
                        offspring.push(newAgent);
                    } else {
                        //sexual
                        if(this.params.breedClosest) {
                            //breeed with closest partner
                            var newAgent = new Agent(this.game, 0, 0, this.params, agent, partner, this.params);
                        } else {
                            //breed with random possible
                            var newAgent = new Agent(this.game, 0, 0, this.params, agent, partners[randomInt(partners.length)]);
                        }
                        offspring.push(newAgent);
                    }
                    if(this.agents.length <= this.params.popMin || (Math.random() < (1.0 - this.params.popMultiplier * (this.agents.length) / this.params.popDenominator))) {
                        offspring.push(agent);
                    }
                }
                this.agents = offspring;
                this.saveStats();
                if(this.params.storeAll) this.storeAll();
            }
            this.toggle = !this.toggle;
        }
    }
};

//store and calculate population stats
Population.prototype.saveStats = function () {
    var popCount = this.agents.length;
    var avgSharePercent = 0;
    var minSharePercent = 100;
    var maxSharePercent = 0;
    var medSharePercent = 0;
    var stdSharePercent = 0;
    var avgBreed = 0;
    var avgShare = 0;

    if(popCount > this.popMax) {
        this.popMax = popCount;
    }

    //sorted array of share percents
    var spArr = this.agents.map(function(agent) {
        return agent.sharePercent;
    });
    spArr.sort();

    //min
    minSharePercent = spArr[0];

    //max
    maxSharePercent = spArr[popCount - 1];
    if(maxSharePercent > this.shareMax) {
        this.shareMax = maxSharePercent;
    }

    //median
    medSharePercent = median(spArr);

    //avg
    for(var k = 0; k < popCount; k++) {
        avgSharePercent += this.agents[k].sharePercent;
        avgBreed += this.agents[k].breedRange;
        avgShare += this.agents[k].shareRange;
    }
    avgSharePercent = avgSharePercent / popCount;
    avgBreed = avgBreed / popCount;
    avgShare = avgShare / popCount;

    //standard deviaton
    stdSharePercent = standardDeviation(spArr);

    this.sharePercAvgHistory.push(avgSharePercent);
    this.sharePercMinHistory.push(minSharePercent);
    this.sharePercMaxHistory.push(maxSharePercent);
    this.sharePercMedHistory.push(medSharePercent);
    this.sharePercStdHistory.push(stdSharePercent);
    this.sharePercStdUpper.push(avgSharePercent + stdSharePercent);
    this.sharePercStdLower.push(avgSharePercent - stdSharePercent);
    this.breedAvgHistory.push(avgBreed);
    this.shareAvgHistory.push(avgShare);
    this.popHistory.push(popCount);

    console.log(popCount);
}

Population.prototype.storeAll = function () {
    if(this.params.storeAll) {
        var flatAgents = this.agents.map(function(agent) {
            var flat = {
                cH: agent.color.h,
                cS: agent.color.s,
                sP: agent.sharePercent,
                sR: agent.shareRange,
                bR: agent.breedRange
            }
            return flat;
        });

        this.completeHistory.push(flatAgents);

        /**
        if(socket && this.params.sendToDB) {
            var agentsData = {
                id: this.id,emit
                day: this.day,
                params: this.params,
                agents: flatAgent
            }
            socket.emit("saveGS", agentsData)
        }*/
    }
}

Population.prototype.serialize = function (skip) {
    var text = "tick,popCount,sharePercentAvg,sharePercentMin,sharePercentMax,sharePercentMedian,sharePercentSD,breedAvg,shareAvg,popId\n";
    for(var i = 0; i < this.popHistory.length; i += skip) {
        text += i + ",";
        text += this.popHistory[i] + ",";
        text += this.sharePercAvgHistory[i] + ",";
        text += this.sharePercMinHistory[i] + ",";
        text += this.sharePercMaxHistory[i] + ",";
        text += this.sharePercMedHistory[i] + ",";
        text += this.sharePercStdHistory[i] + ",";
        text += this.breedAvgHistory[i] + ",";
        text += this.shareAvgHistory[i] + ",";
        text += this.id + "\n";
    }

    return text;
}

Population.prototype.draw = function (ctx) {
    //agent preview grid
    for (var i = 0; i < Math.min((this.params.viewCountX * this.params.viewCountY), this.agents.length); i++) {
        var x = i % this.params.viewCountX;
        var y = Math.floor(i / this.params.viewCountY);
        var agent = this.agents[i];
        var size = this.params.viewAgentSize;
        var colorHeight = size / 2;
        var barHeight = size / 8;

        ctx.fillStyle = hsl(agent.color.h, agent.color.s, agent.color.l);
        ctx.fillRect(x * size, y * size, size, colorHeight);
        var length = agent.food / 2;
        ctx.fillStyle = "Green";
        ctx.fillRect(x * size, y * size + colorHeight, length * size, barHeight);
        length = agent.breedRange / this.params.maxBreed;
        ctx.fillStyle = "Red";
        ctx.fillRect(x * size, y * size + colorHeight + barHeight, length * size, barHeight);
        length = agent.shareRange /this.params.maxShare;
        ctx.fillStyle = "Blue";
        ctx.fillRect(x * size, y * size + colorHeight + 2 * barHeight, length * size, barHeight);
        length = agent.sharePercent;
        ctx.fillStyle = "Black";
        ctx.fillRect(x * size, y * size + colorHeight + 3 * barHeight, length * size, barHeight);
    }

    //population graph
    var startX = this.params.viewCountY * this.params.viewAgentSize + 10;
    var startY = 0;
    var gHeight = 150;
    var gWidth = 360;
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(startX, 0, gWidth, gHeight);
    graph(ctx, this.popHistory, this.popMax, this.params.graphDays, startX, startY, gWidth, gHeight, "purple", "Current");

    //share percent graph
    startY = 160;
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(startX, startY, gWidth, gHeight);
    graph(ctx, this.sharePercMinHistory, this.shareMax, this.params.graphDays, startX, startY, gWidth, gHeight, "lightgreen");
    graph(ctx, this.sharePercAvgHistory, this.shareMax, this.params.graphDays, startX, startY, gWidth, gHeight, "darkgreen", "Average");
    graph(ctx, this.sharePercMedHistory, this.shareMax, this.params.graphDays, startX, startY, gWidth, gHeight, "red");
    graph(ctx, this.sharePercMaxHistory, this.shareMax, this.params.graphDays, startX, startY, gWidth, gHeight, "lightgreen");
    graph(ctx, this.sharePercStdUpper, this.shareMax, this.params.graphDays, startX, startY, gWidth, gHeight, "lightgrey");
    graph(ctx, this.sharePercStdLower, this.shareMax, this.params.graphDays, startX, startY, gWidth, gHeight, "lightgrey");

    //share/breed range graph
    startY = 320;
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(startX, startY, gWidth, gHeight);
    graph(ctx, this.shareAvgHistory, this.params.maxShare, this.params.graphDays, startX, startY, gWidth, gHeight, "blue", "Share Average");
    graph(ctx, this.breedAvgHistory, this.params.maxBreed, this.params.graphDays, startX, startY, gWidth, gHeight, "red", "                                                            Breed Average");

    //color graph
    startY = 480;
    var hsl_img=ASSET_MANAGER.getAsset("./img/hsl.png");
    ctx.drawImage(hsl_img, startX, startY, gWidth, 100);
    mapAgents(ctx, this.agents, startX, startY, gWidth, 100);

    //text info.day
    startY = 600;
    ctx.fillStyle = "Black";
    ctx.fillText("Day: " + this.day + "/" + this.params.maxDays, startX, startY);
};

function mapAgents(ctx, agents, x, y, width, height) {
    var pxX = Math.round(width/360);
    var pxY = Math.round(height/100);

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    for(var i = 0; i < agents.length; i++) {
        ctx.fillRect(x + agents[i].color.h * pxX, y + agents[i].color.s * pxY, pxX * 2 , pxY* 2);
    }
}

// the "main" code begins here
var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/hsl.png");
var socket = null;
if (window.io !== undefined) {
    console.log("Database connected!");
    socket = io.connect('http://24.16.255.56:8888');
}

var newPopulation;

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var play = document.getElementById('play');
    var restart = document.getElementById('restart');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    var expManager = new ExperimentManager();
    var pop;

    var newPop = function() {
        pop = new Population(
            gameEngine,
            expManager.nextParams(),
            expManager.nextPopId(),
            expManager.dataGroup
        );
        gameEngine.addEntity(pop);
    }
    newPopulation = newPop;

    play.onclick = function () {
        pop.params.pause = !pop.params.pause;
    };

    restart.onclick = function () {
        if (gameEngine.entities.length === 1) gameEngine.entities.splice(0, 1);
        pop.params.pause = false;
        newPop();
    };

    newPop();
    gameEngine.init(ctx);
    gameEngine.start();
});
