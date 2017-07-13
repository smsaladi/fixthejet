import numpy as np
import matplotlib.pyplot as plt

# Create data
x = np.random.randn(4096)
y = np.random.randn(4096)

# Create heatmap
heatmap, xedges, yedges = np.histogram2d(x, y, bins=(64,64))
extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]

# Plot heatmap
fig, axis = plt.subplots()

plt.title('np.histogram2d')
plt.ylabel('y')
plt.xlabel('x')

plt.colorbar(axis.pcolor(heatmap, cmap="jet"))


plt.savefig("random2d.png")
plt.savefig("random2d.svg")
plt.savefig("random2d.pdf")

plt.show()
