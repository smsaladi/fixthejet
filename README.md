README
======

Scientists co-opt our visual system to convey numerical data in a format
that's easily understandable using spatial and color variation to capture
details of the underlying data. A “colormap” transforms the set of numbers
into a pattern of plotted colors.

When done poorly, this transformation introduces well-established visual
artifacts and obscures the underlying detail. Furthermore, certain colormaps
create images that are inaccessible to readers with anomalous color vision
(i.e. colorblindness).

Unfortunately, a widely-used colormap "jet" faces these issues but is
pervasive in the scientific literature. Short of contacting the author for
the data and plotting code (perhaps, the "gold standard"), there isn't an
easy way to re-render old images with more friendly colormaps.
`fixthejet` provides a solution!


Explore the application at
[https://shyam.saladi.org/fixthejet](https://shyam.saladi.org/fixthejet),
with a more permanent domain/address to come soon!


## Basic procedure

This javascript app recolors an image rendered using a rainbow colormap
(e.g. jet) to one using a more appropriate, perceptually-uniform colormap.
It does so by inferring the fractional number underlying each color in the
originating colormap, since colormaps are one 1-to-1 relations. The array of
numbers are then re-rendered using a better colormap (nothing fancy).


## Other Notes

Rasterized images (e.g. jpg, png) are not be treated perfectly because of
issues from aliasing and/or compression in these formats. Vector graphics
(e.g. svg) will work well. Beware, several vector graphics formats allow
for rasterized images within the file. Even so, our tests have shown 
pretty decent performance.

If a color in the image isn't perceptually close to one in the originating
colormap (CIELAB-XX < 0.5), then it isn't modified. For example, black,
white, and shades of gray are not modified if `jet` is selected. The lookup
procedure currently scales as the `number of color elements` (vector) or
`number of pixels` (raster), so large raster images take a little bit.


All the code to do this is written in JavaScript and runs client-side (i.e.
on the user's browser). In other words, figures converted with the application
are not sent anywhere (to our "servers" or elsewhere). We do keep track of
page loads with Google Analytics (really just out of curiosity).


Intrigued? Check out our partner project to help detect and warn authors
with figures rendered using rainbow-colormap before these images enter the
literature! [JetFighter](jetfighter.herokuapp.com)!


## TODO

[Alex Guerra](@aguerra) and I put this together as a fun, summer/weekend
project, so forgive any issues you might be facing! Submit a issue or,
better yet, a PR.

Some features we'd like to implement (but may never get to...)

* Fix CSS issues/styling!!

* Gallery!

* More *from* formats. Pull these as HEX colors from mpl and commit to
`colorscales.js`. Need to add to index page, of course.

* Detect colormap likely used. Perhaps JetFighter-like procedure, need to
reimplement in JS

* Cache lookup since colors that are found once likely reappear

* Tests, CI?


## Local testing

Start a webserver from this folder and then navigate to the corresponding url:

1. [Start webserver](https://stackoverflow.com/a/21608670/2320823):
   `python -m http.server`

2. Go to [http://127.0.0.1:8000](http://127.0.0.1:8000)

