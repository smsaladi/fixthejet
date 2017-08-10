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



# plt.imshow(z, cmap=cm.jet, extent=[-20, 20, -20, 20])
# plt.colorbar()
# plt.clim(0, 1)
# plt.savefig("airy_disk.png")
# plt.close()

def reduce_expand(arr, fact):
    arr_small = scipy.misc.imresize(arr, 1/fact)
    arr_expanded = expand_arr(arr_small, fact, fact, 1)
    assert np.array_equal(arr.shape, arr_expanded.shape)
    return arr_expanded


def getAiryDiskImages():
    x = np.linspace(-10, 10, 1000)
    z = airy_Nd(*np.meshgrid(x, x, sparse=True))
    z_jet = cm.jet(z)
    #This will be our input train data (X)
    set_of_compressed_images = [reduce_expand(z_jet, f) for f in [1, 2, 4, 5, 8, 10]]
    for i in range(len(set_of_compressed_images)):
        set_of_compressed_images[i] = truncateInput(set_of_compressed_images[i]) #Takes out the 'a' in rgba images
    image_set = np.array(set_of_compressed_images)
    z = normalizeOutput(z)
    #This will be our output train data (Y)
    z_train = np.array([z, z, z, z, z, z])
    z_train = z_train.reshape(z_train.shape[0], z_train.shape[1], z_train.shape[2], 1)
    return (image_set, z_train)

def truncateInput(img): #takes a standard python array (mxnx4 -> mxnx3)
    return img[:,:,:3]

def normalizeOutput(arr): #takes a standard python array (normalizes to between 0 and 1)
    return (arr - arr.min()) * 1/(arr.max()-arr.min())
