from flask import Flask, Request, Response, render_template, jsonify, json
from flask_restful import Resource, Api, reqparse
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import glob
import numpy as np
from resources.AlexNetViz import AlexNetViz

app = Flask(__name__)
api = Api(app)

if __name__ == '__main__':
    
    path = '../data'
    models =  ['Model'+str(i) for i in np.arange(1,17)]
    body_parts = ['Shoulder', 'Humerus', 'Finger', 'Elbow', 'Wrist', 'Forearm', 'Hand']
    filename = 'abnormal_results.csv'
    color = ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "e0f3f8", "91bfdb", "4575b4", "#999999"]
    data = {}

    #read model results
    for part in body_parts:
        for model in models:
            pathname = os.path.join(path, part, model, filename)
            data[part+'_'+model] = pd.read_csv(pathname)
    
    #add resources 
    api.add_resource(AlexNetViz, 
            '/main',
            resource_class_kwargs={'data' : data,                                   
                'body_parts' : body_parts,
                'color' : color});
    api.add_resource(DenseNetViz, 
            '/main/model=<model>/view=<view>',
            '/main/model=<model>/view=<view>/part=<part>',
            resource_class_kwargs={'data' : data,                                   
                'body_parts' : body_parts,
                'color' : color});



    app.run(debug = True)


