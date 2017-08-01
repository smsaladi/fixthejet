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

x = np.linspace(-10, 10, 1000)
z = airy_Nd(*np.meshgrid(x, x, sparse=True))

plt.imshow(z, cmap=cm.jet, extent=[-20, 20, -20, 20])
plt.colorbar()
plt.clim(0, 1)
plt.savefig("airy_disk.png")
plt.close()

z_jet = cm.jet(z)
z_jet_small = scipy.misc.imresize(z_jet, 0.1)
plt.imshow(z_jet_small)
plt.clim(0, 1)
plt.savefig("airy_disk_small.png")

plt.show()
