import numpy as np
import functools
import operator
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import scipy.misc

def getData():
    images = [] #Use images.append(img) to add to this. Convert to np array at the end
    arrays = [] #Use arrays.append(arr) to add to this. Convert to np array at the end
    for a in range(1,9):
        for b in range(1, 4):
            for c in  range(1, 3):
                for d in range(1, 3):
                    x = np.linspace(0, a, 1000) #1-8
                    y = np.linspace(0, b, 1000)[:, np.newaxis] #1-3
                    if (c == 2):
                        y = -y
                    z = 10 * np.cos(x**2) * np.exp(-y) #sin-cos and y, -y
                    z_jet = cm.jet(z)
    for a in range(1,9):
        for b in range(1, 4):
            for c in  range(1, 3):
                for d in range(1, 3):
                    x = np.linspace(0, a, 1000) #1-8
                    y = np.linspace(0, b, 1000)[:, np.newaxis] #1-3
                    if (c == 2):
                        y = -y
                    z = 10 * np.sin(x**2) * np.exp(-y) #sin-cos and y, -y
                    z_jet = cm.jet(z)
                    z = normalizeOutput(z)
                    z_jet = truncateInput(cm.jet(z))
                    out = [z, z, z, z, z, z]
                    inp = [reduce_expand(z_jet, f) for f in [1, 2, 4, 5, 8, 10]]
                    images.extend(inp)
                    arrays.extend(out)

    arrays = np.array(arrays)
    arrays = arrays.reshape(arrays.shape[0], arrays.shape[1], arrays.shape[2], 1)
    return (np.array(images), arrays)




# x = np.linspace(0,6, 1000) #1-8
# y = np.linspace(0,3, 1000)[:, np.newaxis] #1-3
# z = 10 * np.cos(x**2) * np.exp(-y) #sin-cos and y, -y
# z_jet = cm.jet(z)
# plt.imshow(z, cmap=cm.jet)
# plt.show()
#Here, z_jet is our "input" image and z is our "output" for training
#Luminance profile generation should generate 8*3*2*2*6=576 data points for training

#           576 augments of this data


def reduce_expand(arr, fact):
    arr_small = scipy.misc.imresize(arr, 1/fact)
    arr_expanded = expand_arr(arr_small, fact, fact, 1)
    assert np.array_equal(arr.shape, arr_expanded.shape)
    return arr_expanded

def truncateInput(img): #takes a standard python array (mxnx4 -> mxnx3)
    return img[:,:,:3]

def normalizeOutput(arr): #takes a standard python array (normalizes to between 0 and 1)
    return (arr - arr.min()) * 1/(arr.max()-arr.min())

def expand_arr(from_arr, *args):
    """Expands a plate using a given row and col size
    """
    # multiply each element of the list args together
    new_size = functools.reduce(operator.mul, args, 1)
    stamp = np.ones(new_size)
    stamp.shape = args
    return np.kron(from_arr, stamp).astype(from_arr.dtype)
