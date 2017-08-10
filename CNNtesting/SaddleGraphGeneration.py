import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import scipy.misc
import functools
import operator


def getData():
    images = [] #Use images.append(img) to add to this. Convert to np array at the end
    arrays = [] #Use arrays.append(arr) to add to this. Convert to np array at the end

    for a in range(1,4): #Saddlepoint 1 - 162 augments
        for b in range(1,4):
            for c in range(1,4):
                x1 = np.linspace(-c,c,1000)
                y1 = np.linspace(-1,1,1000)[:, np.newaxis]
                z1 = x1**b-(a*x1*(y1**2))
                z1 = normalizeOutput(z1)
                z_jet1 = truncateInput(cm.jet(z1))
                out = [z1, z1, z1, z1, z1, z1]
                inp = [reduce_expand(z_jet1, f) for f in [1, 2, 4, 5, 8, 10]]
                images.extend(inp)
                arrays.extend(out)




    for a in range(0,2): #Saddlepoint 2 - 384 augments
        for b in range(0,2):
            for c in range(2,4):
                for d in range(2,4):
                    for e in range(1,3):
                        for f in range(1,3):
                            x2 = np.linspace(-1,a,1000)
                            y2 = np.linspace(-1,b,1000)[:, np.newaxis]
                            z2 = (e * x2**c)-(1 * y2**d) #exp - 2 or 3, x coef = 1 or 2
                            if (f == 2):
                                z2 *= -1
                            z2 = normalizeOutput(z2)
                            z_jet2 = truncateInput(cm.jet(z2))
                            out = [z2, z2, z2, z2, z2, z2]
                            inp = [reduce_expand(z_jet2, f) for f in [1, 2, 4, 5, 8, 10]]
                            images.extend(inp)
                            arrays.extend(out)


    for c in range(2,4): #Saddlepoint 3 - 768 augments
        for d in range(2,4):
            for e in range(1,3):
                for f in range(1,3):
                    for a in range(1,3):
                        for b in range(1,3):
                            for g in  range(1,3):
                                x3 = np.linspace(-1,1,1000)
                                y3 = np.linspace(-1,1,1000)[:, np.newaxis]
                                z3 = (e * x3**c)-(1 * y3**d) + ((x3**b)* (y3**g) * a) #same as s2, but last number 1 or 2
                                if (f == 2):
                                    z3 *= -1
                                z3 = normalizeOutput(z3)
                                z_jet3 = truncateInput(cm.jet(z3))
                                out = [z3, z3, z3, z3, z3, z3]
                                inp = [reduce_expand(z_jet3, f) for f in [1, 2, 4, 5, 8, 10]]
                                images.extend(inp)
                                arrays.extend(out)

    arrays = np.array(arrays)
    arrays = arrays.reshape(arrays.shape[0], arrays.shape[1], arrays.shape[2], 1)
    return (np.array(images), arrays)



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
#Saddlepoint 1
# x1 = np.linspace(-1,1,1000)
# y1 = np.linspace(-1,1,1000)[:, np.newaxis]
# z1 = x1**3-(3*x1*(y1**2))
# z1 = normalizeOutput(z1)
# z_jet1 = truncateInput(cm.jet(z1))
# plt.imshow(z1, cmap=cm.jet)
# plt.show()

#Saddlepoint 2 - 384 augments
# x2 = np.linspace(-1,1,1000)
# y2 = np.linspace(-1,1,1000)[:, np.newaxis]
# z2 = (1 * x2**3)-(1 * y2**3) #exp - 2 or 3, x coef = 1 or 2
# z2 = normalizeOutput(z2)
# z_jet2 = truncateInput(cm.jet(z2))
# plt.imshow(z2, cmap=cm.jet)
# plt.show()

#Saddlepoint 3 - 768 augments
# x3 = np.linspace(-1,1,1000)
# y3 = np.linspace(-1,1,1000)[:, np.newaxis]
# z3 = (1 * x3**2)-(1 * y3**3) + (x3 * y3 * 1) #same as s2, but last number 1 or 2
# z3 = normalizeOutput(z3)
# z_jet3 = truncateInput(cm.jet(z3))
# plt.imshow(z3, cmap=cm.jet)
# plt.show()
