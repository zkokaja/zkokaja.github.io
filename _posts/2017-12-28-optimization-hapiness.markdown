---
layout: post
title: "Optimization, Happiness, and Entropy"
date: 2017-12-28 18:10:00
categories: [math, cs, life]
tags: [math,cs,life]
customjs:
  - https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js
  - https://cdnjs.cloudflare.com/ajax/libs/function-plot/1.18.1/function-plot.js
---

<img src='/images/thumb_3ds.png' width="200px" 
     style='float:left; padding-right: 10px' 
     alt="Cartoon image of fox and hedgehog."/>
It's not often that a topic formed in mathematics and leveraged in computer
science finds itself relevant to our every day lives. We can, however, gain some
wisdom from a brief look into [optimization][3]. This is not optimization in the
sense of increasing efficiency, but rather is concerned with finding maximums 
or minimums of functions.
<br style='clear:both;' />

<script>
window.onload = function() {

    functionPlot({
        target: '#plot1',
        data: [{
        fn: '-x^2+1',
        derivative: {
                fn: '-2x',
                updateOnMouseMove: true
            }
        }],
        xAxis: {domain: [-4,4]},
        yAxis: {domain: [-2,2]},
    });

    functionPlot({
        target: '#plot2',
        data: [{
            fn: '-(x^2+x-1)*(x^2+4x+3)',
            graphType: 'polyline'
        }],
        xAxis: {domain: [-4,2]},
        yAxis: {domain: [-2,5]},
    });
}
</script>

Let's consider the graph for a quadratic function:

<div id="plot1" style="display:inline-block; width:100%; text-align:center;">
</div>

Imagine we would like to explain to the computer how to find the maximum value
for this function. For us it couldn't be simpler, we can see where it tops off;
but a computer needs more explicit instructions. One easy way would be to have
it start at some position and move left or right, depending on which one
increases the current value. We repeat this in incremental steps until we
reach a point that has no increasing steps. And there we have it, that's the
basic hill climbing optimization algorithm!

The hill climbing metaphor is a good one. It goes likes this: imagine you're on
a hill and wish to summit it, blindfolded. What do you do? Just like our
algorithm, you feel which direction is 'up', move that way, and repeat until
everything around you is descending.

But do you sense a problem with this approach? If so, you are correct. Consider
two hills in close proximity, or a function such as:

<div id="plot2" style="display:inline-block; width:100%; text-align:center;">
</div>

If we begin at the leftmost point and move upward as before, we reach the first
hill thinking it's the highest peak. Only to realize there's a higher one to the
right. It seems our algorithm found a _local_ maximum, but is not sufficient to
find the _global_ maximum.

---

To solve this problem, let us take a detour into [metallurgy][2]. Blacksmiths have
long known that in order to make a material workable and to provide a strong
structure, they must apply a heat treatment. They raise the temperature of the
metal for a while, and then slowly let it cool to room temperature. At the
atomic level, the atoms become agitated and move around quickly when heated. But
as it cools, the atoms re-crystalize into a stronger structure. The heating and
cooling rates determine how flexible and strong it becomes.

The annealing process introduces us to the idea of entropy and randomness to
achieve better results than otherwise. In fact, randomness is crucial in many
computer science applications - e.g. cryptography.

So let us integrate this into our solution. Let's say we start off at a
random position on our graph and find a maximum, then we repeat the process by
starting at a _different_ random position. We can do this many times and keep
track of our best or maximum value. This is traditionally called [random
restarts][5], and provides us with a much better algorithm that can find global
maximums.

As a bonus for the thorough reader, this annealing process is even more closely
followed in CS by another optimization method called [Simulated Annealing][4] in
which the amount of randomness (how much we jump around) is controlled. It
starts off quite high just like the high temperature, and gradually decreases
until the algorithm approaches the global maximum.

---

Okay, I promised this would relate to life so let's wrap around to it. Sylvia
Plath saw her future prospects as [figs on tree][1]: one as a poet, another as a
professor, yet another as a family. And it was up to her to make a choice for a
particular branch. Or succumb to paralysis and stay put.

I like this metaphor. But I prefer a different one now that I know about
optimization. Life is like a 2D version of our graphs, a range of rolling hills.
Starting from our childhood, many decisions are made for us and we are carried
through this landscape. As we grow, we gain responsibility and begin to make
decisions that lead us in narrower directions. Not necessarily going up or down
any particular hill though.

Sometimes we let life make the decisions for us. If we're really unlucky we end
up in a local minimum with difficulty getting out. We could also find ourselves
on a good course by pure chance or good starting conditions. If we plan ahead
and see a hill we like, we can climb and eventually summit it. This landscape
is foggy however, and the hill we are on may not be the one that will make us
the happiest.

What can we do? Optimize. Lay down ropes and begin your descent. Restart, not
entirely randomly perhaps, but choose another hill and start climbing. If after
a few steps it doesn't seem fruitful, restart again. Make your own decisions,
prototype your life, and optimize your happiness.

[1]:https://www.goodreads.com/quotes/7511-i-saw-my-life-branching-out-before-me-like-the
[2]:https://en.wikipedia.org/wiki/Annealing_(metallurgy)
[3]:https://en.wikipedia.org/wiki/Mathematical_optimization
[4]:https://en.wikipedia.org/wiki/Simulated_annealing
[5]:https://en.wikipedia.org/wiki/Hill_climbing
