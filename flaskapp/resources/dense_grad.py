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

    ## functions 

def denseCAM(img_path, out_path):
    ######### densenet gradcam  ################
    def hook_feature(module, input, output):
        features_blobs.append(output.data.cpu().numpy())

    def returnCAM(feature_conv, weight_softmax, class_idx):
        # generate the class activation maps upsample to 256x256
        size_upsample = (256, 256)
        bz, nc, h, w = feature_conv.shape
        output_cam = []
        #print(class_idx)
        for idx in class_idx:
            #print(idx)
            cam = weight_softmax.dot(feature_conv.reshape((nc, h*w)))
            cam = cam.reshape(h, w)
            cam = cam - np.min(cam)
            cam_img = cam / np.max(cam)
            cam_img = np.uint8(255 * cam_img)
            output_cam.append(cv2.resize(cam_img, size_upsample))
        return output_cam

    normalize = transforms.Normalize(
        mean=[0.456],
        std= [0.225]
       #mean=[0.485, 0.456, 0.406],
       #std=[0.229, 0.224, 0.225]
    )
    preprocess = transforms.Compose([
       transforms.Resize((224,224)),
       transforms.ToTensor(),
       normalize
    ])

    ## init densenet
    dense_net169 = models.densenet169(pretrained=True)
    for param in dense_net169.features.parameters():
        param.requires_grad = False
    ## change laters
    dense_net169.features._modules['conv0']  = nn.Conv2d(1, 64, kernel_size=(7, 7), 
                                                         stride=(2, 2), padding=(3, 3), bias=False)
    #Adjust to grayscale = 1 channel. Requires gradient is True by default
    dense_net169.classifier = nn.Linear(in_features=1664, out_features=1, bias=True)
    dense_net169.to(device)
    dense_net169.load_state_dict(torch.load('../models/densenet_elbow.pth', map_location='cpu'))
    
    ## add gradcam
    finalconv_name = 'features'
    dense_net169.eval()
    # hook the feature extractor
    features_blobs = []
    dense_net169._modules.get(finalconv_name).register_forward_hook(hook_feature)
    # get the softmax weight
    params = list(dense_net169.parameters())
    weight_softmax = np.squeeze(params[-2].data.cpu().numpy())
    
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
    output = dense_net169(image.reshape(1, 1, 227, 227))
    pred_code = int(torch.sigmoid(output).data > 0.5)
    switcher = {
            0: "Normal",
            1: "Abnormal"
    }
    pred_label = switcher.get(pred_code)
    
    ## hook cam
    finalconv_name = 'features'
    dense_net169.eval()
    ## hook the feature extractor
    features_blobs = []
    ## get the softmax weight
    params = list(dense_net169.parameters())
    weight_softmax = np.squeeze(params[-2].data.cpu().numpy())
    
    ## process image for cam
    img_pil = Image.open(img_path)
    img_pil = img_pil.convert(mode='L')
    img_tensor = preprocess(img_pil)
    img_variable = Variable(img_tensor.unsqueeze(0))
    logit = dense_net169(img_variable)
    h_x = torch.sigmoid(logit).data.squeeze()
    probs, idx = h_x.sort(0, True)
    probs = np.array([probs.cpu().numpy()])
    idx = np.array([idx.cpu().numpy()])
    
    CAMs = returnCAM(features_blobs[0], weight_softmax, [idx[0]])
    # render the CAM and output
    #print('output CAM.jpg for the top1 prediction: %s'%classes[idx[0]])
    img = cv2.imread(img_path,0)
    img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY,11,2)
    img = np.float32(cv2.resize(img, (224, 224)))/2
    img = np.reshape(img,(224,224,1))
    height, width,_ = img.shape
    heatmap = cv2.applyColorMap(cv2.resize(CAMs[0],(width, height)), cv2.COLORMAP_WINTER)
    result = heatmap * 0.95 + img * 0.5
    cv2.imwrite(out_path, result)
    gc.collect()
    
    return pred_label