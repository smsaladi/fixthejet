"""Example data and figures to compare colormaps

As in
    Borland and Taylor, IEEE Computer Graphics and Applications, 2007
    doi:10.1109/MCG.2007.323435

"""

import argparse

import numpy as np

from bokeh.io import output_file, show, save
from bokeh.layouts import gridplot
from bokeh.plotting import figure


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output_file")
    parser.add_argument("--shape", type=int, nargs=2, default=[1000, 1000])
    args = parser.parse_args()

    output_file(args.output_file)

    shape = args.shape

    # prep figures
    p_figs = [figure(x_range=(0, 5), y_range=(0, 5)) for i in range(4)]

    # Linear
    # Middle 2 args dont matter for this
    linear = linear_box(shape)
    plot_arr(p_figs[0], linear)

    # Linear with discontinuity
    linear_discont = linear_box(shape, 685, 30)
    plot_arr(p_figs[1], linear_discont)

    # Gaussian
    gauss = gaussian_box(shape, (shape[0] / 2, shape[1] / 2), shape[0] * 8)
    plot_arr(p_figs[2], gauss)

    # Sinusoidal with linear multiplier
    sinusoid = sinusoid_box(shape)
    plot_arr(p_figs[3], sinusoid)

    grid = gridplot([p_figs[:2], p_figs[2:]], plot_width=200, plot_height=200)

    save(grid)
    show(grid)
    return

def plot_arr(fig, data):
    fig.image(image=[data], x=0, y=0, dw=5, dh=5, palette="Viridis256")
    fig.xaxis.visible = False
    fig.yaxis.visible = False
    return

def sinusoid_box(shape):
    x, y = np.arange(shape[0]), np.arange(shape[1])

    # slight linear gradient
    factor = 1 - (y * .5 + shape[0] * .25) / shape[0]

    x_sin = np.sin(40 * x / shape[0])
    y_cos = np.cos(20 * y / shape[1])

    x_rep = np.repeat([x_sin], shape[1], axis=0)
    y_rep = np.repeat([y_cos], shape[0], axis=0)

    return (x_rep + y_rep.transpose()) * factor


def linear_box(shape, position=None, length=None):
    """Makes a linear gradient with a discontinuity, if requested
    """
    if position is not None and length is not None:
        x1 = np.arange(position)
        x2 = np.arange(position + length, shape[1] + length - 1)
        x = np.concatenate((x1, x2))
    else:
        x = np.arange(shape[0])

    return np.repeat([x], shape[1], axis=0)


def gaussian_box(shape, center, sigma):
    x = np.arange(shape[0])
    y = np.arange(shape[1])
    xx, yy = np.meshgrid(x, y)
    s = (xx - center[0])**2 + (yy - center[1])**2
    return np.exp(-s / (2 * sigma))


if __name__ == '__main__':
    main()
