from flask_restful import Resource
import numpy as np
from sklearn.metrics import accuracy_score

class AlexNetViz(Resource):
    
    def __init__(self, **kwargs):
        self.data = kwargs['data']
        self.body_parts = kwargs['body_parts']
        self.color = kwargs['color']

    def get(self):
        #json for body-part classification
        #get single model from each body parts to extract the classification results for Alex net
        #color encoding for body parts

        links = []
        nodes = [{'name' : 'Input',
                'color' : self.color[7]}]
        for i, df in enumerate(self.data.values()):
             if i%16 != 0:
                 continue
             pred_label = int(df.Body_Prediction[0])
             label_counts = df.Body_Label.value_counts()
             accuracy = float(accuracy_score(y_true = df.Body_Label, y_pred = df.Body_Prediction))
             #construct node dictionary 
             nodes.extend([{'name' : self.body_parts[pred_label],
                 'color' : self.color[pred_label],
                 'accuracy' : accuracy}])
             #construct link dictionary 
             links.extend([{'source' : 0,
                  'target' : pred_label+1,
                 'value' : 1,
                 'count' : int(label_counts[label]),
                 'color' : self.color[label]
                 }for label in label_counts.keys()])
        results = {'nodes' : nodes, 'links' : links}
        return results
