# Screeps

This is my AI code for the game [screeps](https://screeps.com/).

It's far from the best AI out there, but it will be...

## Philosophy

I'm generally taking a defensive approach against external pressures i.e. I refill towers before spawns.

## Breakdown

There are two main branches of AI at the moment - spawn AI and creep AI. These can be found in spawns.js and creeps.js respectfully.

Spawn AI is broken up into "stages", which is dictated by the amount of energy capacity available to it.

