// GameBoard code below
var params = {
    mutRate: 0.05, //?
    mutStep: 64, //?
    viewCountX: 30,
    viewCountY: 30,
    viewAgentSize: 24,
    maxBreed: 8, //?
    maxShare: 8, //?
    maxDiff: 1,
    sharePercentModifier: 0.1, //?
    popStart: 100,
    popMin: 1000,
    popMultiplier: 0.10,
    popDenominator: 1500,
    skipClock: true,
    clockStep: 0.1,
    breedClosest: true,
    shareWithSelfish: false,
    maxDays: 10000
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function hsl(h, s, l) {
    return "hsl(" + h + "," + s + "%," + l + "%)";
}

function randomMut(prev, step, max, prob) {
    var result = prev;
    if (Math.random() < prob) {
        if (randomInt(2)) {
            result += randomInt(step);
        } else {
            result -= randomInt(step);
        }
        return (result + step * max) % max;
    }
    return result;
}

function geneticMut(a, b) {
    var trit = randomInt(3);
    if (trit === 0) {
        return a;
    } else if (trit === 1) {
        return b;
    } else {
        return Math.floor((a + b) / 2);
    }
}

function Agent(game, x, y, mother, father) {
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
        this.breedRange = geneticMut(mother.breedRange, father.breedRange);
        this.shareRange = geneticMut(mother.shareRange, father.shareRange);

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
        this.breedRange = randomMut(this.breedRange, params.mutStep, params.maxBreed, params.mutRate);
        this.shareRange = randomMut(this.shareRange, params.mutStep, params.maxShare, params.mutRate);

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

        this.breedRange = randomInt(params.maxBreed);
        this.shareRange = randomInt(params.maxShare);
        this.sharePercent = 0;
    }

    this.food = 0;

    Entity.call(this, game, x, y);
}

Agent.prototype = new Entity();
Agent.prototype.constructor = Agent;

/*
Agent.prototype.update = function () {

}

Agent.prototype.draw = function (ctx, x, y) {
    if (x) this.x = x;
    if (y) this.y = y;
    var size = 32;

    ctx.fillStyle = rgb(this.color.r, this.color.g, this.color.b);
    ctx.fillRect(this.x * size, this.y * size, size, size/2);
    var length = this.food / 2;
    ctx.fillStyle = "Green";
    ctx.fillRect(this.x * size, this.y * size + size / 2, length * size, size / 8);
    length = this.breedRange / params.maxBreed;
    ctx.fillStyle = "Red";
    ctx.fillRect(this.x * size, this.y * size + size/2 + size/8, length * size, size/8);
    length = this.shareRange / params.maxShare;
    ctx.fillStyle = "Blue";
    ctx.fillRect(this.x * size, this.y * size + size / 2 + 2 * size / 8, length * size, size / 8);
    length = this.sharePercent;
    ctx.fillStyle = "Black";
    ctx.fillRect(this.x * size, this.y * size + size / 2 + 3 * size / 8, length * size, size / 8);

    //ctx.strokeStyle = "Black";
    //ctx.strokeRect(this.x * size, this.y * size, size / 2, size / 2);

}*/

Agent.prototype.difference = function (agent) {
    var h = Math.abs(agent.color.h - this.color.h);
    var s = Math.abs(agent.color.s - this.color.s);
    return Math.sqrt(h*h - s*s);
}

function Population(game) {
    this.agents = [];
    this.elapsed = 0;
    this.toggle = false;
    this.popHistory = [];
    this.avgShareHistory = [];
    this.history = [];
    this.popMax = 0;
    this.days = 0;

    for (var i = 0; i < params.popStart; i++) {
        this.agents.push(new Agent(game, 0, 0));
    }

    Entity.call(this, game, 0, 0);
};

Population.prototype = new Entity();
Population.prototype.constructor = Population;

Population.prototype.forage = function(){
    var val = (Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random())/4;
    //var val = Math.random() * 2;
    return val;
}

Population.prototype.update = function () {
    //wait for clock if enabled
    var advance = params.skipClock;
    this.elapsed += this.game.clockTick;
    if (this.elapsed > params.clockStep) {
        advance = true;
        this.elapsed -= params.clockStep;
    }

    //limit to max number of generations
    if(this.days++ > params.maxDays  || this.agents.length === 0) {
        console.log("Creating new population");

        this.removeFromWorld = true;
        var pop = new Population(this.game);
        this.game.addEntity(pop);
    }

    // feed
    if (advance) {
        //for (var i = 0; i < this.agents.length; i++) {
        //    var agent = this.agents[i];
        //    console.log(i + ": r " + agent.color.r + " g " + agent.color.g + " b " + agent.color.b);
        //}
        if (!this.toggle) {
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
                            if ((other.sharePercent > 0 || params.shareWithSelfish) && agent.difference(other) < agent.shareRange) {
                                partners.push(other);
                            }
                        }
                    }

                    for (var j = 0; j < partners.length; j++) {
                        partners[j].food += agent.sharePercent * agent.food / partners.length * 2;
                    }
                    agent.food -= agent.sharePercent * agent.food;
                }
            }
        } else {
            // breed
            var breeders = [];
            var offspring = [];
            var partners = [];
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
                var diff = params.maxDiff;

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
                    var newAgent = new Agent(this.game, 0, 0, agent, agent);
                    offspring.push(newAgent);
                } else {
                    //sexual
                    if(params.breedClosest) {
                        //breeed with closest partner
                        var newAgent = new Agent(this.game, 0, 0, agent, partner);
                    } else {
                        //breed with random possible
                        var newAgent = new Agent(this.game, 0, 0, agent, partners[randomInt(partners.length)]);
                    }
                    offspring.push(newAgent);
                }
                if(this.agents.length <= params.popMin || (Math.random() < (1.0 - params.popMultiplier * (this.agents.length) / params.popDenominator))) {
                    offspring.push(agent);
                }
            }
            this.agents = offspring;

            //store and calculate population stats
            console.log(this.agents.length);
            var avgSharePercent = 0;
            for(var k = 0; k < this.agents.length; k++) {
                avgSharePercent += this.agents[k].sharePercent;
            }
            this.avgShareHistory.push(avgSharePercent / this.agents.length);
            this.popHistory.push(this.agents.length);
            this.history.push(this.agents);
            if(this.agents.length > this.popMax) this.popMax = this.agents.length;
        }
        this.toggle = !this.toggle;
    }
};

Population.prototype.draw = function (ctx) {
    for (var i = 0; i < Math.min((params.viewCountX * params.viewCountY), this.agents.length); i++) {
        var x = i % params.viewCountX;
        var y = Math.floor(i / params.viewCountY);
        var agent = this.agents[i];
        //agent.draw(ctx, x, y);
        var size = params.viewAgentSize;
        var colorHeight = size / 2;
        var barHeight = size / 8;
        //ctx.strokeStyle = "Black";
        //ctx.strokeRect(x * size, y * size, size / 2, size / 2);

        //agent preview grid
        ctx.fillStyle = hsl(agent.color.h, agent.color.s, agent.color.l);
        ctx.fillRect(x * size, y * size, size, colorHeight);
        var length = agent.food / 2;
        ctx.fillStyle = "Green";
        ctx.fillRect(x * size, y * size + colorHeight, length * size, barHeight);
        length = agent.breedRange / params.maxBreed;
        ctx.fillStyle = "Red";
        ctx.fillRect(x * size, y * size + colorHeight + barHeight, length * size, barHeight);
        length = agent.shareRange / params.maxShare;
        ctx.fillStyle = "Blue";
        ctx.fillRect(x * size, y * size + colorHeight + 2 * barHeight, length * size, barHeight);
        length = agent.sharePercent;
        ctx.fillStyle = "Black";
        ctx.fillRect(x * size, y * size + colorHeight + 3 * barHeight, length * size, barHeight);
    }

    //population graph
    var startX = params.viewCountY * params.viewAgentSize + 10;
    graph(ctx, this.popHistory, this.popMax, 200, startX, 0, 400, 150, "purple");

    //share graph
    graph(ctx, this.avgShareHistory, 0.5, 200, startX, 160, 400, 150, "red");

    //paint colors
    paintColorBG(ctx, startX, 320, 360, 100);
    mapAgents(ctx, this.agents, startX, 320, 360, 100);

};

function mapAgents(ctx, agents, x, y, width, height) {
    var pxX = Math.round(width/360);
    var pxY = Math.round(height/100);

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    for(var i = 0; i < agents.length; i++) {
        ctx.fillRect(x + agents[i].color.h * pxX, y + agents[i].color.s * pxY, pxX * 2 , pxY* 2);
    }
}

function paintColorBG(ctx, x, y, width, height) {
    var pxX = Math.round(width/360);
    var pxY = Math.round(height/100);
    for(var i = 0; i < 360; i++) {
        for(var j = 0; j < 100; j++) {
            ctx.fillStyle = hsl(i, j, 50);
            ctx.fillRect(x + i *pxX, y + j*pxY, pxX, pxY);
        }
    }
}

function graph(ctx, arr, max, count, x, y, width, height, style) {
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = "Black";
    ctx.fillText("Current: " + arr[arr.length - 1] + " Max: " + max, x, y + 10);

    ctx.strokeStyle = style;
    var px = 0;
    var step = width / count;
    var startY = y + height;

    var i = Math.max(0, arr.length - count); //display the last (max) events
    ctx.moveTo(x, startY - arr[i]/height);
    ctx.beginPath();
    while(i < arr.length) {
        ctx.lineTo(x + px++ * step, startY - arr[i]/(max/height));
        i++;
    }
    ctx.stroke();
}


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var pop = new Population(gameEngine);
    gameEngine.addEntity(pop);
    gameEngine.init(ctx);
    gameEngine.start();
});
