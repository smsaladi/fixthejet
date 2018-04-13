import random

import numpy as np
import matplotlib.pyplot as plt

# set seed for reproducibility
np.random.seed(42)
random.seed(42)

# Create data
x = np.random.randn(4096)
y = np.random.randn(4096)

# Create heatmap
heatmap, xedges, yedges = np.histogram2d(x, y, bins=(64,64))

# Plot heatmap
fig, axis = plt.subplots()

plt.title('np.histogram2d')
plt.ylabel('y')
plt.xlabel('x')

# File types to save
ftypes = ['png', 'jpg', 'tif', 'pdf', 'svg']

# Render viridis-colored image
cb = plt.colorbar(axis.pcolor(heatmap, cmap="viridis"))
for f in ftypes:
    plt.savefig("random2d_viridis." + f)

# Render jet-colored image
cb.remove()
plt.colorbar(axis.pcolor(heatmap, cmap="jet"))
for f in ftypes:
    plt.savefig("random2d_jet." + f)
