
// GameBoard code below

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

function Agent(game, x, y, mother, father) {
    this.color = { r: 0, g: 0, b: 0 };
    this.maxBreed = 8;
    this.maxShare = 8;
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
        var trit = randomInt(3);
        if (trit === 0) {
            this.color.r = mother.color.r;
        } else if (trit === 1) {
            this.color.r = father.color.r;
        } else {
            this.color.r = Math.floor((mother.color.r + father.color.r) / 2);
        }
        trit = randomInt(3);
        if (trit === 0) {
            this.color.g = mother.color.g;
        } else if (trit === 1) {
            this.color.g = father.color.g;
        } else {
            this.color.g = Math.floor((mother.color.g + father.color.g) / 2);
        }
        trit = randomInt(3);
        if (trit === 0) {
            this.color.b = mother.color.b;
        } else if (trit === 1) {
            this.color.b = father.color.b;
        } else {
            this.color.b = Math.floor((mother.color.b + father.color.b) / 2);
        }
        trit = randomInt(3);
        if (trit === 0) {
            this.breedRange = mother.breedRange;
        } else if (trit === 1) {
            this.breedRange = father.breedRange;
        } else {
            this.breedRange = Math.floor((mother.breedRange + father.breedRange) / 2);
        }
        trit = randomInt(3);
        if (trit === 0) {
            this.shareRange = mother.shareRange;
        } else if (trit === 1) {
            this.shareRange = father.shareRange;
        } else {
            this.shareRange = Math.floor((mother.shareRange + father.shareRange) / 2);
        }
        trit = randomInt(3);
        if (trit === 0) {
            this.sharePercent = mother.sharePercent;
        } else if (trit === 1) {
            this.sharePercent = father.sharePercent;
        } else {
            this.sharePercent = Math.floor((mother.sharePercent + father.sharePercent) / 2);
        }

        // mutation
        var mutationRate = 0.05;
        var mutationStep = 64;
        if (Math.random() < mutationRate) {
            if (randomInt(2)) {
                this.color.r += randomInt(mutationStep);
            } else {
                this.color.r -= randomInt(mutationStep);
            }
            this.color.r = (this.color.r + 256) % 256;
        }
        if (Math.random() < mutationRate) {
            if (randomInt(2)) {
                this.color.g += randomInt(mutationStep);
            } else {
                this.color.g -= randomInt(mutationStep);
            }
            this.color.g = (this.color.g + 256) % 256;
        }
        if (Math.random() < mutationRate) {
            if (randomInt(2)) {
                this.color.b += randomInt(mutationStep);
            } else {
                this.color.b -= randomInt(mutationStep);
            }
            this.color.b = (this.color.b + 256) % 256;
        }
        if (Math.random() < mutationRate) {
            if (randomInt(2)) {
                this.breedRange += randomInt(mutationStep);
            } else {
                this.breedRange -= randomInt(mutationStep);
            }
            this.breedRange = (this.breedRange + this.maxBreed) % this.maxBreed;
        }
        if (Math.random() < mutationRate) {
            if (randomInt(2)) {
                this.shareRange += randomInt(mutationStep);
            } else {
                this.shareRange -= randomInt(mutationStep);
            }
            this.shareRange = (this.shareRange + this.maxShare) % this.maxShare;
        }
        if (Math.random() < mutationRate) {
            //this.sharePercent = randomInt(2);
            if (randomInt(2)) {
                this.sharePercent += Math.random()*0.1;
            } else {
                this.sharePercent -= Math.random()*0.1;
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

        this.breedRange = randomInt(this.maxBreed);
        this.shareRange = randomInt(this.maxShare);
        this.sharePercent = 0;
    }

    this.food = 0;

    Entity.call(this, game, x, y);
}

Agent.prototype = new Entity();
Agent.prototype.constructor = Agent;

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
    length = this.breedRange / this.maxBreed;
    ctx.fillStyle = "Red";
    ctx.fillRect(this.x * size, this.y * size + size/2 + size/8, length * size, size/8);
    length = this.shareRange / this.maxShare;
    ctx.fillStyle = "Blue";
    ctx.fillRect(this.x * size, this.y * size + size / 2 + 2 * size / 8, length * size, size / 8);
    length = this.sharePercent;
    ctx.fillStyle = "Black";
    ctx.fillRect(this.x * size, this.y * size + size / 2 + 3 * size / 8, length * size, size / 8);

    //ctx.strokeStyle = "Black";
    //ctx.strokeRect(this.x * size, this.y * size, size / 2, size / 2);

}

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

    for (var i = 0; i < 100; i++) {
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
    var advance = true;
    this.elapsed += this.game.clockTick;
    if (this.elapsed > 0.1) {
        advance = true;
        this.elapsed -= 0.1;
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
                var diff = 10000;

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
                if(this.agents.length <= 1000 || (this.agents.length > 1000 && Math.random() < (1.0 - 0.1*(this.agents.length)/2000))) offspring.push(agent);
            }
            this.agents = offspring;
            console.log(this.agents.length);
        }
        this.toggle = !this.toggle;
    }
};

Population.prototype.draw = function (ctx) {
    for (var i = 0; i < this.agents.length; i++) {
        var x = i % 25;
        var y = Math.floor(i / 25);
        var agent = this.agents[i];
        //agent.draw(ctx, x, y);
        var size = 32;
        //ctx.strokeStyle = "Black";
        //ctx.strokeRect(x * size, y * size, size / 2, size / 2);

        ctx.fillStyle = rgb(agent.color.r, agent.color.g, agent.color.b);
        ctx.fillRect(x * size, y * size, size, size / 2);
        var length = agent.food / 2;
        ctx.fillStyle = "Green";
        ctx.fillRect(x * size, y * size + size / 2, length * size, size / 8);
        length = agent.breedRange / agent.maxBreed;
        ctx.fillStyle = "Red";
        ctx.fillRect(x * size, y * size + size / 2 + size / 8, length * size, size / 8);
        length = agent.shareRange / agent.maxShare;
        ctx.fillStyle = "Blue";
        ctx.fillRect(x * size, y * size + size / 2 + 2 * size / 8, length * size, size / 8);
        length = agent.sharePercent;
        ctx.fillStyle = "Black";
        ctx.fillRect(x * size, y * size + size / 2 + 3 * size / 8, length * size, size / 8);
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
