

const SEA = 0;
const GRASS = 1;
const PLAIN = 2;
const SWAMP = 3;
const FOREST = 4;
const HILL = 5;
const MOUNTAIN = 6;

/**
 * lager et kart for civ
 * prøver å lage øyer med hav rundt
 * @param {array} theMap 
 * @param {int} w 
 * @param {int} h 
 */
function build(w, h) {
    // fill map with ocean/sea
    let theMap = Array(w).fill(0);
    theMap = theMap.map(e => Array(h).fill(0));

    // generate random number of islands
    // x,y is pos, r is radius
    let islandCount = roll(5, 18);
    let islands = Array(islandCount).fill(0);
    let maxR = Math.min(w, h) / 2;
    let minR = Math.max(4, maxR - islandCount);
    islands = islands.map((e) => ({ x: roll(1, w - 1), y: roll(1, h - 1), r: roll(minR, maxR) }));

    // place initial mountain at island seed
    islands.forEach(e => { theMap[e.x][e.y] = MOUNTAIN })

    // stand on each island and throw stones
    islands.forEach(e => {
        let iter = Math.min(90, e.r * e.r);
        for (let i = 0; i < iter; i++) {
            let p = throwStone(e);
            let x = (p.x + w) % w;
            let y = (p.y + h) % h;
            if (!theMap[x]) {
                console.log(x, y);
            }
            if (theMap[x][y] === SEA) {
                // close to island === mountain
                // far away === grass
                let t = 3 + Math.floor(Math.random() * 9 * (1 - p.r / e.r));
                theMap[x][y] = Math.min(MOUNTAIN, t);
            }
        }
    });


    // create land around high ground (mountain -> hills -> forrest -> swamp -> grass)
    theMap.forEach((e, x) => e.forEach((e, y) => {
        if (e === SEA) {
            // check in 6 directions
            let adjacent = getNeighbours(x, y);
            let m = Math.max(...adjacent);
            if (adjacent.length > 1 && m > GRASS) {
                theMap[x][y] = m - roll(1, m - 1);
            }
        }
    }))


    if (islandCount < 12) {
        // do it twice to grow some more land
        // create land around high ground (mountain -> hills -> forrest -> swamp -> grass)
        theMap.forEach((e, x) => e.forEach((e, y) => {
            if (e === SEA) {
                // check in 6 directions
                let m = Math.max(...getNeighbours(x, y));
                if (m > GRASS) {
                    theMap[x][y] = m - roll(1, m - 1);
                }
            }
        }))
    }


    function getNeighbours(x, y) {
        n = [];
        n.push(theMap[(x + w - 1) % w][y]);
        n.push(theMap[(x + 1) % w][y]);
        n.push(theMap[x][(y + 1) % h]);
        n.push(theMap[x][(y + h - 1) % h]);
        n.push(theMap[(x + w - 1) % w][(y + 1) % h]);
        n.push(theMap[(x + 1) % w][(y + h - 1) % h]);
        return n.filter(e => e > 0);
    }




    return [theMap, islands];
}

/**
 * Random number [lo,hi]
 * @param {int} lo 
 * @param {int} hi 
 */
function roll(lo, hi) {
    let diff = 1 + hi - lo;
    return Math.floor(Math.random() * diff) + lo;
}


/**
 * We stand on an island and throw a stone in random direction
 * The landing is within the island radius
 * @param {Object} island 
 */
function throwStone(island) {
    let r = island.r;
    let R = r * r;
    let x, y;
    do {
        x = roll(-r, r);
        y = roll(-r, r);
    } while (x * x + y * y > R);
    return { x: island.x + x, y: island.y + y, r: Math.sqrt(x * x + y * y) }
}