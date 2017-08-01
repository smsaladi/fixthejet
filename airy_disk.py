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

def expand_plate(from_arr, row_size, col_size):
    """Expands a plate using a given row and col size
    """
    stamp = np.ones(row_size * col_size)
    stamp.shape = [row_size, col_size, 1]
    return np.kron(from_arr, stamp).astype(from_arr.dtype)

x = np.linspace(-10, 10, 1000)
z = airy_Nd(*np.meshgrid(x, x, sparse=True))

plt.imshow(z, cmap=cm.jet, extent=[-20, 20, -20, 20])
plt.colorbar()
plt.clim(0, 1)
plt.savefig("airy_disk.png")
plt.close()

z_jet = cm.jet(z)
z_jet_small = scipy.misc.imresize(z_jet, .1)
z_jet_expanded = expand_plate(z_jet_small, 10, 10)
plt.imshow(z_jet_small)
plt.clim(0, 1)
plt.savefig("airy_disk_small.png")

plt.show()
