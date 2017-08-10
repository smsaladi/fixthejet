import numpy as np
from keras import backend as tf
from keras.models import Model
from keras.callbacks import EarlyStopping
from keras import losses
from keras.layers import Conv2D, Input
from keras.optimizers import Adam
import math
import random
import JetImageData as jid

#custom kernel initializer to make our convolution better
#NOTE: may need to take in params
def makefilter(shape, dtype='float32'): #For testing, may want to put in print statement here to see whats going on
    filterR = makeGaussian(filterSize, meanR, stdDevR)
    filterG = makeGaussian(filterSize, meanG, stdDevG)
    filterB = makeGaussian(filterSize, meanB, stdDevB)
    filter = [filterR, filterG, filterB]
    npfilter = np.dstack(filter)
    return tf.variable((npfilter.reshape(npfilter.shape[0], npfilter.shape[1], 3, 1)))

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
        k[tuple(c)] = math.exp(-s/(2*sigma))
    return k

image_data = jid.getData()
image_set = image_data[0]
array_set = image_data[1]

lth = len(image_set)
numValData = 1
numTestData = 1
if (math.floor(lth * .1) > 1):
    numValData = math.floor(lth * .1)
    numTestData = numValData #Have the Validation data and test data take up 10%
                                #of total data each
validata_image = [None] * numValData
validata_array = [None] * numValData
for i in range(numValData):
    rand = random.randint(0,len(image_set) - 1)
    a = image_set[rand]
    b = array_set[rand]
    image_set = np.delete(image_set, rand, axis = 0)
    array_set = np.delete(array_set, rand, axis = 0)
    validata_image[i] = a
    validata_array[i] = b
validata = (np.array(validata_image), np.array(validata_array))



meanR = (5,5)
stdDevR = .01

meanG = (5,5)
stdDevG = .01

meanB = (5,5)
stdDevB = .01
filterSize = (11,11)

input = Input(shape=(None, None, 3))
convLayer = Conv2D(1, filterSize, padding='same', kernel_initializer=makefilter)(input)
model = Model(inputs=input, outputs=convLayer)

optimizer=Adam(lr=1e-3)
#compile model with Adam optimizer and mean_squared_error loss calculation
h = model.compile(optimizer, loss=losses.mean_squared_error)
#Stop when validation loss converges to prevent overfitting
earlyStopping = EarlyStopping(monitor='val_loss', patience=1, verbose=0, mode='auto')
#train the model!
model.fit(image_set, array_set, batch_size=32, nb_epoch=20, verbose=1, callbacks=[earlyStopping],
 validation_data=validata)


#Last step: Save the model
model.save_weights('model.hdf5')
with open('model.json', 'w') as f:
    f.write(model.to_json())
