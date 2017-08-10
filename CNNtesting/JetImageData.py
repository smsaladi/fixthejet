import numpy as np
import AiryTrainingGeneration as atg
import LuminanceProfGeneration as lpg
import WAVGeneration as wavg
import SaddleGraphGeneration as sgg


def getData():
    (images, arrays) = sgg.getData()

    hold = atg.getAiryDiskImages()
    images = np.concatenate((images, hold[0]), axis = 0)
    arrays = np.concatenate((arrays, hold[1]), axis = 0)

    hold = lpg.getData()
    images = np.concatenate((images, hold[0]), axis = 0)
    arrays = np.concatenate((arrays, hold[1]), axis = 0)
    print(images.shape)
    images = images[::2,:,:,:]
    arrays = arrays[::2,:,:,:]
    print(images.shape)
    #data is a tuple of two 1d np arrays, the first is images, second is array data
    return (images, arrays)
