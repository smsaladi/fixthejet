README
======

The starts of a conversion utility to take a jet-colored plot
and recolor it to a better colormap.

Some code:
```python

def jet_to_number(r, g, b):
  """convert a jet pixel into it's value
  http://blogs.mathworks.com/cleve/2015/02/02/origins-of-colormaps/
  """

  if g == 0 and r == 0:
    return b/4 - 1/8
  elif b == 1 and r == 0:
    return g/4 + 1/8
  elif g == 1:
    return r/4 + 3/8       # or -b/4 + 5/8
  elif r == 1 and b == 0:
    return -g/4 + 7/8
  elif g == 0 and b == 0:
    return -r/4 + 9/8

```
