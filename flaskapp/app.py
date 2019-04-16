from flask import Flask, Request, Response, render_template, jsonify, json
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import glob
import numpy as np
import pickle
from resources.AlexNetViz import AlexNetViz
from resources.DenseNetViz import DenseNetViz
from resources.GradCAMViz import GradCAMViz

app = Flask(__name__)
api = Api(app)
CORS(app)


def getData(filename, fetch = 'all', from_pickle = False):
#read model results
    data = {}
    for part in body_parts:
        for model in models:
            name = part + '_' + model
            pathname = os.path.join(path, part, model)
            if(from_pickle == False):
                data[name] = pd.read_csv(os.path.join(pathname, filename))
            else:
                pathname = os.path.join(path, 'pickle')
                _name = name + '.pkl'
                data[name] = pd.read_pickle(os.path.join(pathname, fetch, _name))
            data[name].rename(columns = {'Abormal_Prediction' : 'Abnormal_Prediction'},
                inplace = True)
    return data

if __name__ == '__main__':
    
    path = '../data/'
    models =  ['Model'+str(i) for i in np.arange(1,17)]
    body_parts = ['Shoulder', 'Humerus', 'Finger', 'Elbow', 'Wrist', 'Forearm', 'Hand']
    filename = 'abnormal_results.csv'
    cam_filename = 'gradcam_abnormal_results.csv'
    best_n = [15, 4, 11, 7, 6, 10, 11]
    best_model = [body_parts[i]+'_Model'+str(n) for i,n in enumerate(best_n)]
    color = {'Shoulder' : '#d73027', 
            'Humerus' : '#fc8d59', 
            'Finger' : '#fee090', 
            'Elbow' : '#ffffbf', 
            'Wrist' : '#e0f3f8', 
            'Forearm' : '#91bfdb', 
            'Hand' : '#4575b4', 
            'Input' : '#999999',
            'Normal' : '#5ab4ac',
            'Abnormal' : '#d8b365'}

    

    #read model results 
    #set from_pickle = true if read is from pickle, set fetch = 'cam' to fetch dataframes required for gradcam, otherwise 'all'
    data_all = getData(filename, fetch = 'all', from_pickle = True)
    data_cam = getData(cam_filename, fetch = 'cam', from_pickle = True)

    #read paths for gradcam images
    p_in = open('../data/pickle/cam/paths.pkl', 'rb')
    part_imgs = pickle.load(p_in)

    #add resources 
    api.add_resource(AlexNetViz, 
            '/main',
            resource_class_kwargs={'data' : data_all,                                   
                'body_parts' : body_parts,
                'color' : color,
                'best_model' : best_model});
    
    api.add_resource(DenseNetViz, 
            '/main/<string:predPart>/model=<model>/view=<view>',
            '/main/<string:predPart>/model=<model>/view=<view>/<string:truePart>',
            resource_class_kwargs={'data' : data_all,                                   
                'body_parts' : body_parts,
                'color' : color,
                'best_model' : best_model});

    api.add_resource(GradCAMViz,
            '/main/<string:category>',
            resource_class_kwargs = {'data' : data_cam,
                'body_parts' : body_parts,
                'path' : path,
                'part_imgs' : part_imgs}); 

    app.run(debug = True)


