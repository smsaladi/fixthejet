"""
Writes out hex colors from color scales provided in matplotlib
into JS file

python colors_from_mpl.py >> js/colorscales.js
"""

import itertools
import json

import numpy as np
import matplotlib.colors
import matplotlib.cm

# Have colormaps separated into categories:
# http://matplotlib.org/examples/color/colormaps_reference.html
cmap_names = [
    ('Perceptually Uniform Sequential', [
        'viridis', 'plasma', 'inferno', 'magma']),
    ('Sequential', [
        'Greys', 'Purples', 'Blues', 'Greens', 'Oranges', 'Reds',
        'YlOrBr', 'YlOrRd', 'OrRd', 'PuRd', 'RdPu', 'BuPu',
        'GnBu', 'PuBu', 'YlGnBu', 'PuBuGn', 'BuGn', 'YlGn']),
    ('Sequential (2)', [
        'binary', 'gist_yarg', 'gist_gray', 'gray', 'bone', 'pink',
        'spring', 'summer', 'autumn', 'winter', 'cool', 'Wistia',
        'hot', 'afmhot', 'gist_heat', 'copper']),
    ('Diverging', [
        'PiYG', 'PRGn', 'BrBG', 'PuOr', 'RdGy', 'RdBu',
        'RdYlBu', 'RdYlGn', 'Spectral', 'coolwarm', 'bwr', 'seismic']),
    ('Qualitative', [
        'Pastel1', 'Pastel2', 'Paired', 'Accent',
        'Dark2', 'Set1', 'Set2', 'Set3',
        'tab10', 'tab20', 'tab20b', 'tab20c']),
    ('Miscellaneous', [
        'flag', 'prism', 'ocean', 'gist_earth', 'terrain', 'gist_stern',
        'gnuplot', 'gnuplot2', 'CMRmap', 'cubehelix', 'brg', 'hsv',
        'gist_rainbow', 'rainbow', 'jet', 'nipy_spectral', 'gist_ncar'])
    ]

cm_names = [cat[1] for cat in cmap_names]
values = np.linspace(0, 1, 256)

print("var mpl_scales = {")

for name in itertools.chain.from_iterable(cm_names):
    cmap = matplotlib.cm.get_cmap(name)
    rgba = cmap(values)
    hex = np.apply_along_axis(matplotlib.colors.rgb2hex, axis=1, arr=rgba)
    print('  "{}": {},\n'.format(name, json.dumps(hex.tolist())))

print("};")
