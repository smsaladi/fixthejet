import numpy as np
import math
import random
import matplotlib.pyplot as plt


dim = [1000, 1000]

# Linear
linArr = makeLinear(False, 0, 0, dim)  # Middle 2 args dont matter for this

# Linear with Discontinuity
linArrJump = makeLinear(True, 685, 30, dim)

# Gaussian
gauss = makeGaussian(dim, (dim[0] / 2, dim[1] / 2), dim[0] * 8)

# Sinusoidal with linear multiplier
sinuArr = makeSinu(dim)


def makeSinu(dim):
    x_arr = np.linspace(0, dim[0] - 1, dim[0])
    y_arr = np.linspace(0, dim[1] - 1, dim[1])
    final = [[0 for x in range(dim[0])] for y in range(dim[1])]
    for i in enumerate(x_arr):
        for j in enumerate(y_arr):
            x = i[1]
            y = j[1]
            factor = 1 - (((y * .5) + (dim[0] * .25)) / dim[0])
            final[i[0]][j[0]] = (math.cos(20 * x / dim[0]) +
                                 math.sin(40 * y / dim[1])) * factor
    return np.array(final)


def makeLinear(hasDiscontinuity, position, length, dim):
    if (hasDiscontinuity):
        x1 = np.linspace(0, position - 1, position)
        x2 = np.linspace(position + length,
                         dim[1] + length - 1, dim[1] - position)
        x = np.concatenate((x1, x2))
    else:
        x = np.linspace(0, dim[0] - 1, dim[0])
    arr = [None] * dim[1]
    for i in range(dim[1]):
        arr[i] = x
    return np.array(arr)


def makeGaussian(shape, mean, sigma):
    coors = [range(shape[d]) for d in range(len(shape))]
    k = np.zeros(shape=shape)
    cartesian_product = [[]]
    for coor in coors:
        cartesian_product = [x + [y] for x in cartesian_product for y in coor]
    for c in cartesian_product:
        s = 0
        for cc, m in zip(c, mean):
            s += (cc - m)**2
        k[tuple(c)] = math.exp(-s / (2 * sigma))
    return k
