from flask import Flask, Request, Response, render_template, jsonify, json
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import glob
import numpy as np
from resources.AlexNetViz import AlexNetViz
from resources.DenseNetViz import DenseNetViz

app = Flask(__name__)
api = Api(app)
CORS(app)

if __name__ == '__main__':
    
    path = '../data/'
    models =  ['Model'+str(i) for i in np.arange(1,17)]
    body_parts = ['Shoulder', 'Humerus', 'Finger', 'Elbow', 'Wrist', 'Forearm', 'Hand']
    filename = 'abnormal_results.csv'
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
    data = {}

    #read model results
    for part in body_parts:
        for model in models:
            pathname = os.path.join(path, part, model, filename)
            name = part + '_' + model  
            data[name] = pd.read_csv(pathname)
            data[name].rename(columns = {'Abormal_Prediction' : 'Abnormal_Prediction'},
                inplace = True)

    #add resources 
    api.add_resource(AlexNetViz, 
            '/main',
            resource_class_kwargs={'data' : data,                                   
                'body_parts' : body_parts,
                'color' : color});
    
    api.add_resource(DenseNetViz, 
            '/main/<string:predPart>/model=<model>/view=<view>',
            '/main/<string:predPart>/model=<model>/view=<view>/<string:truePart>',
            resource_class_kwargs={'data' : data,                                   
                'body_parts' : body_parts,
                'color' : color});

    app.run(debug = True)


