## What is MURA?

MURA (musculoskeletal radiographs) is a large dataset of bone X-rays. Algorithms are tasked with determining whether an X-ray study is normal or abnormal.

Musculoskeletal conditions affect more than 1.7 billion people worldwide, and are the most common cause of severe, long-term pain and disability, with 30 million emergency department visits annually and increasing.

More information on the dataset can be found [here](https://stanfordmlgroup.github.io/competitions/mura/)

## Model Architecture

Every X-ray image can be a normal or abnormal:

1. Elbow
2. Finger
3. Forearm
4. Hand
5. Humerus
6. Shoulder
7. Wrist


Conceptually, this is a hierarchical convolutional neural network involving two steps:

1. Classifying the body part into 1 of 7 types.
2. Running the image through 1 of the 7 classifiers built for each body part.

![Architecture](https://github.com/DarkestFloyd/DS5500Project/raw/master/d3_particles/img/architecture.png)
