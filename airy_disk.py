import functools
import operator

import numpy as np
import scipy.special

import matplotlib.cm as cm
import matplotlib.pyplot as plt

import scipy.misc

def airy_1d(r):
    """Intensity of a 1D airy disk"""
    r_zeros = r == 0
    r[r_zeros] = 1
    # Obtain intensities using Bessel function of the first kind
    a_disk = (2 * scipy.special.jn(1, r) / r)**2
    a_disk[r_zeros] = 1
    return a_disk

def airy_Nd(*args):
    return airy_1d(np.linalg.norm(args))

def expand_arr(from_arr, *args):
    """Expands a plate using a given row and col size
    """
    # multiply each element of the list args together
    new_size = functools.reduce(operator.mul, args, 1)
    stamp = np.ones(new_size)
    stamp.shape = args
    return np.kron(from_arr, stamp).astype(from_arr.dtype)

x = np.linspace(-10, 10, 1000)
z = airy_Nd(*np.meshgrid(x, x, sparse=True))
z_jet = cm.jet(z)

plt.imshow(z, cmap=cm.jet, extent=[-20, 20, -20, 20])
plt.colorbar()
plt.clim(0, 1)
plt.savefig("airy_disk.png")
plt.close()

def reduce_expand(arr, fact):
    arr_small = scipy.misc.imresize(arr, 1/fact)
    arr_expanded = expand_plate(arr_small, fact, fact, 1)
    assert np.array_equal(arr.shape, arr_expanded.shape)
    return arr_expanded

set_of_images = [reduce_expand(z_jet, f) for f in [2, 4, 5, 8, 10]]
