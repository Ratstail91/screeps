# AI Explanation

This is how I coded my screeps AI. For those who don't know, https://screeps.com/ is a game for programmers, where you write actual JavaScript to control "creeps", or little robot thingies that travel around and perform automated tasks - you don't interact with the game directly, only through code.

At first, my AI was based on "roles" just like the tutorials teach you, but it quickly became apparent that having to add a new role for every specialized creep wouldn't scale well. Everyone in the game designs their AI differently, but here is how I did mine: Behaviour Stacks!
In programming, a stack is basically a list of items where you can only access the top element. In my screeps code, every creep has a "stack" of behaviours, which are executed from the top and, if it determines that it's appropriate, passes the process to the next behaviour down the stack. So a harvester creep's AI would look something like this:

[CRY, FEAR, DEPOSIT, HARVEST, UPGRADE]

This means:
* Cry for help if you see an enemy
* Run away from any enemies if you see them
* Deposit your resources
* Harvest resources
* Upgrade the controller

Stacks are also bookended by behaviours called TOP and BOTTOM, which are useful for various other tasks that I'll get to in a minute.
 
Lets look deeper into the harvester AI so I can explain what particular behaviours are doing:

## CRY

Screeps' world is divided into rooms, and this behaviour stores the room's name into a global array where I can access it with the BRAVE behaviour.

## FEAR

Each creep tracks their origin spawn, and this one causes them to return to the safety of that spawn if they see an enemy.

## DEPOSIT

This one causes the creep to return to deposit any energy it's carrying into a nearby "store". Something interesting with the behaviours is that they can be modified with parameters, and this one can actually be tailored with a specialized priority list of store types. So normally, creeps store things in towers, spawns, extensions, etc. but I can set a specific creep to store only in a nearby container instead.

## HARVEST

This is an interesting one: It actually interacts with TOP, causing TOP to intercept the process and pass directly to HARVEST. The direct upshot of this is that creeps that are harvesting become "locked" in place, and will continue to harvest, ignoring the behaviour stack regardless of anything going on around them. This has it's benefits and drawbacks, though.

## UPGRADE

Finally, this behaviour is a fallback that also "locks" in place once upgrading begins. If nothing else can be done by the harvester creep i.e. it's full, but the stores are full, etc. then it will dump the excess energy into the room's controller, which essentially contributes towards my overall game level.

I divided the behaviours this way to allow for behaviours to be mixed-and-matched. i.e. when a room is just starting out and the creeps are fairly cheap to produce, I can omit CRY and FEAR. If I want to produce an upgrader creep, I can use [CRY, FEAR, HARVEST, UPGRADE] and skip depositing entirely. The same goes for BUILD and REPAIR, which build and repair structures respectfully. There are other behaviours, like PATROL which circles between specified points, and TARGET, which makes a creep travel to a point before passing to the next behaviour, etc.

On the whole, this is just one way to do AI, and for most situations is actually pretty overkill. But for a game like screeps, where CPU efficiency is king and AI is the name of the game, a strong and robust system is necessary. It's far from complete, but I really like this AI structure.
