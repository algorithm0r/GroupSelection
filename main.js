// GameBoard code below
var params = {
    mutRate: 0.05,
    mutStep: 64,
    viewCountX: 30,
    viewCountY: 30,
    viewAgentSize: 24,
    maxBreed: 8,
    maxShare: 8,
    maxDiff: 10000,
    sharePercentModifier: 0.1,
    popStart: 100,
    popMin: 1000,
    popMultiplier: 0.15,
    popDenominator: 2000,
    skipClock: true,
    clockStep: 0.1
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

function mod(num, mod) {
    var remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
}

function randomMut(prev, step, max, prob) {
    var result = prev;
    if (Math.random() < prob) {
        if (randomInt(2)) {
            result += randomInt(step);
        } else {
            result -= randomInt(step);
        }
        return mod(result, max);
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
    this.color = { r: 0, g: 0, b: 0 };
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
        this.color.r = geneticMut(mother.color.r, father.color.r);
        this.color.g = geneticMut(mother.color.g, father.color.g);
        this.color.b = geneticMut(mother.color.b, father.color.b);
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
        this.color.r = randomMut(this.color.r, params.mutStep, 256, params.mutRate);
        this.color.g = randomMut(this.color.g, params.mutStep, 256, params.mutRate);
        this.color.b = randomMut(this.color.b, params.mutStep, 256, params.mutRate);
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
            r: randomInt(256),
            g: randomInt(256),
            b: randomInt(256)
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
    var r = Math.abs(agent.color.r - this.color.r);
    var g = Math.abs(agent.color.g - this.color.g);
    var b = Math.abs(agent.color.b - this.color.b);
    return Math.sqrt(r*r + g*g + b*b);
}

function Population(game) {
    this.agents = [];
    this.elapsed = 0;
    this.toggle = false;

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
    var advance = params.skipClock;
    this.elapsed += this.game.clockTick;
    if (this.elapsed > params.clockStep) {
        advance = true;
        this.elapsed -= params.clockStep;
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
                            if (other.sharePercent > 0 && agent.difference(other) < agent.shareRange) {
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
                    var newAgent = new Agent(this.game, 0, 0, agent, partners[randomInt(partners.length)]);
                    offspring.push(newAgent);
                }
                if(this.agents.length <= params.popMin || (Math.random() < (1.0 - params.popMultiplier * (this.agents.length) / params.popDenominator))) {
                    offspring.push(agent);
                }
            }
            this.agents = offspring;
            console.log(this.agents.length);
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

        ctx.fillStyle = rgb(agent.color.r, agent.color.g, agent.color.b);
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
};


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
