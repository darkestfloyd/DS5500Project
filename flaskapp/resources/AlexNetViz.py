from flask_restful import Resource
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix

class AlexNetViz(Resource):
    
    def __init__(self, **kwargs):
        self.data = kwargs['data']
        self.body_parts = kwargs['body_parts']
        self.best_model = kwargs['best_model']
        self.color = kwargs['color']
        self.ckeys = ['tn', 'fp', 'fn', 'tp']
    
    def get(self):
        #json for body-part classification
        #get single model from each body parts to extract the classification results for Alex net
        #color encoding for body parts

        links = []
        nodes = [{'name' : 'Input',
                'color' : self.color['Input']}]
        cm_all = np.zeros((2,2))
        for name in self.best_model:
              
             df = self.data[name] 
             pred_label = int(df.Body_Prediction[0])
             label_counts = df.Body_Label.value_counts()
             accuracy = float(accuracy_score(y_true = df.Body_Label, y_pred = df.Body_Prediction))
             cm_part = confusion_matrix(y_true = df.Abnormal_Label, y_pred = df.Abnormal_Prediction)
             cm_all = np.add(cm_part, cm_all)
             #construct node dictionary 
             nodes.extend([{'name' : self.body_parts[pred_label],
                 'color' : self.color[self.body_parts[pred_label]],
                 'accuracy' : accuracy}])
             #construct link dictionary 
             links.extend([{'source' : 0,
                  'target' : pred_label+1,
                 'value' : 1,
                 'count' : int(label_counts[label]) 
                            if label_counts[label]<10 else int(label_counts[label]/10),
                 'color' : self.color[self.body_parts[label]]
                 }for label in label_counts.keys()])
       
        tn, fp, fn, tp = np.divide(cm_all, 7).ravel()
        cm = { self.ckeys[0] : int(tn),
            self.ckeys[1] : int(fp),
            self.ckeys[2] : int(fn),
            self.ckeys[3] : int(tp) }
                
        
        results = {'nodes' : nodes, 'links' : links, 'confusion_matrix' : cm}
        return results
