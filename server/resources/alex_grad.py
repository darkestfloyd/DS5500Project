import io
import requests
from PIL import Image
from torchvision import models, transforms
from torch.autograd import Variable
#import pdb
import random
#import csv
import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
import torch.nn.functional as F
import torch.optim as optim
import os
from PIL import Image
import torchvision.models as models
import gc

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

##################
## alex gradcam ##
##################

### alexnet grad cam ####

import torch
from torch.autograd import Variable
from torch.autograd import Function
from torchvision import models
from torchvision import utils
import cv2
import sys
import numpy as np
import argparse

class FeatureExtractor():
    """ Class for extracting activations and 
    registering gradients from targetted intermediate layers """
    def __init__(self, model, target_layers):
        self.model = model
        self.target_layers = target_layers
        self.gradients = []

    def save_gradient(self, grad):
        self.gradients.append(grad)

    def __call__(self, x):
        outputs = []
        self.gradients = []
        for name, module in self.model._modules.items():
            #print(x)
            x = module(x)
            if name in self.target_layers:
                x.register_hook(self.save_gradient)
                outputs += [x]
                
        return outputs, x

class ModelOutputs():
    """ Class for making a forward pass, and getting:
    1. The network output.
    2. Activations from intermeddiate targetted layers.
    3. Gradients from intermeddiate targetted layers. """
    def __init__(self, model, target_layers):
        self.model = model
        self.feature_extractor = FeatureExtractor(self.model.features, target_layers)

    def get_gradients(self):
        return self.feature_extractor.gradients

    def __call__(self, x):
        target_activations, output  = self.feature_extractor(x)
        output = output.view(output.size(0), -1)
        output = self.model.classifier(output)
        return target_activations, output

def preprocess_image(img):
    means=[0.456]
    stds=[0.225]
    preprocessed_img = img.copy()[: , :, ::-1]
    for i in range(1):
        preprocessed_img[:, :, i] = preprocessed_img[:, :, i] - means[i]
        preprocessed_img[:, :, i] = preprocessed_img[:, :, i] / stds[i]
    preprocessed_img = np.ascontiguousarray(np.transpose(preprocessed_img, (2, 0, 1)))
    preprocessed_img = torch.from_numpy(preprocessed_img.copy())
    preprocessed_img.unsqueeze_(0)
    input = Variable(preprocessed_img, requires_grad = True)
    return input

def show_cam_on_image(img, mask):
    heatmap = cv2.applyColorMap(np.uint8(255*mask),  cv2.COLORMAP_WINTER)
    heatmap = np.float32(heatmap) / 255
    cam = heatmap + np.float32(img)
    cam = cam / np.max(cam)
    #cv2.imwrite("../temp/code.jpg", np.uint8(255 * cam))
    return np.uint8(255 * cam)

class GradCam:
    def __init__(self, model, target_layer_names, use_cuda):
        self.model = model
        self.model.eval()
        self.cuda = use_cuda
        if self.cuda:
            self.model = model.cuda()

        self.extractor = ModelOutputs(self.model, target_layer_names)


    def forward(self, input):
        return self.model(input) 


    def __call__(self, input, index = None):
        if self.cuda:
            features, output = self.extractor(input.cuda())
        else:
            features, output = self.extractor(input)


        if index == None:
            index = np.argmax(output.cpu().data.numpy())


        one_hot = np.zeros((1, output.size()[-1]), dtype = np.float32)
        one_hot[0][index] = 1

        one_hot = Variable(torch.from_numpy(one_hot), requires_grad = True)
        if self.cuda:
            one_hot = torch.sum(one_hot.cuda() * output)

        else:
            one_hot = torch.sum(one_hot * output)

        self.model.features.zero_grad()
        self.model.classifier.zero_grad()
        one_hot.backward(retain_graph=True)
        grads_val = self.extractor.get_gradients()[-1].cpu().data.numpy()
        
        target = features[-1]
        target = target.cpu().data.numpy()[0, :]

        weights = np.mean(grads_val, axis = (2, 3))[0, :]
        cam = np.zeros(target.shape[1 : ], dtype = np.float32)


        for i, w in enumerate(weights):
            cam += w * target[i, :, :]

        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (227, 227))
        cam = cam - np.min(cam)
        cam = cam / np.max(cam)
        return cam
    
    
######################
## main
#####################

def alexCAM(img_path, out_path):
    # load alexnet
    alex_net = models.alexnet(pretrained=True)
    for param in alex_net.parameters():
        param.requires_grad = False
    alex_net.features._modules['0'] = nn.Conv2d(1, 64, kernel_size=(11, 11), stride=(4, 4), padding=(2, 2))
    #Adjust Output
    alex_net.classifier._modules['6'] = nn.Linear(4096, 7)
    alex_net.to(device)
    alex_net.load_state_dict(torch.load('../models/alexnet.pth', map_location='cpu'))

    # predict
    ## transform
    image = cv2.imread(img_path,0)
    image = cv2.adaptiveThreshold(image,255,cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY,11,2)  
    image = Image.fromarray(image)
    image = image.convert('L')

    ### Apply tensor transformations to images
    img_transform = transforms.Compose([transforms.Resize((227,227)),
                                                              transforms.ToTensor(),
                                                              transforms.Normalize(
                                                                  mean=[0.456],
                                                                  std= [0.225])])
    image = img_transform(image)
    ## predict
    output = alex_net(image.reshape(1, 1, 227, 227))
    pred_code = int(torch.max(output, 1)[1])
    switcher = {
            0: "Shoulder",
            1: "Humerus",
            2: "Finger",
            3: "Elbow",
            4: "Wrist",
            5: "Forearm",
            6: "Hand"
    }
    pred_label = switcher.get(pred_code)

    # CAM
    grad_cam = GradCam(model = alex_net,target_layer_names = ["11"], use_cuda=False)
    img = cv2.imread(img_path, 0)
    img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY,11,2) 
    img = np.float32(cv2.resize(img, (227, 227))) / 255
    img = np.reshape(img,(227,227,1))
    input = preprocess_image(img)

    # If None, returns the map for the highest scoring category.

    # Otherwise, targets the requested index.
    target_index = None
    mask = grad_cam(input, target_index)
    results = show_cam_on_image(img, mask)
    cv2.imwrite(out_path, results)
    
    return pred_label