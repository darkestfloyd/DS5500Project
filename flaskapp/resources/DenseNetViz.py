from flask_restful import Resource
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix
import pandas as pd

class DenseNetViz(Resource):

    def __init__(self, **kwargs):
        self.data = kwargs['data']
        self.body_parts = kwargs['body_parts']
        self.color = kwargs['color']
        self.nkeys = ['name', 'color', 'accuracy']
        self.lkeys = ['source', 'target', 'value', 'count', 'color']
        self.classes = ['Normal', 'Abnormal']

    def get(self, predPart, model = 0, view = 'all', truePart = 'all'):
        
        links = []
        self.predPart = predPart
        self.truePart = truePart
        self.predIdx = self.body_parts.index(self.predPart)
        print("Part idx: ", self.predIdx, '\n')
        
        #get model
        if model == 0:
            #best model-TBD
            model = self.data[self.predPart+'_Model'+ str(2)]
        else:
            model = self.data[self.predPart+'_Model'+ str(model)]

        #get view
        #view abnormal flow for all points
        if(view == 'all'):
            
            self.accuracy_part = float(accuracy_score(y_true = model.Body_Label,
                                            y_pred = model.Body_Prediction))
            nodes = self.generateNodes(model)
            links = self.generateLinks(model)
            results = {'nodes': nodes, 'links': links}
            
            return results
            
        #view abnormal flow for correctly classified points
        if(view == 'classified'):
            
            _model = model[model.Body_Label == self.predIdx]
            self.accuracy_part = 1
            nodes = self.generateNodes(_model)
            links = self.generateLinks(_model)
            return results
       
        #view flow of all misclassififed points
        if(view == 'misclassified'):
            if(truePart == 'all'):
                _model = model[model.Body_Label != self.predIdx]
                misclass_counts = _model.Body_Label.value_counts(normalize = True)
                nodes = [{'h' : float(misclass_counts[idx]),
                     'color' : self.color[self.body_parts[idx]]} 
                    for idx in misclass_counts.keys()]
                links = self.generateLinks(_model)
                
            else:
                try:
                    self.trueIdx = self.body_parts.index(self.truePart)
                    print("true part idx: ", self.trueIdx)
                except:
                    msg = "incorrect body part name"
                    print(msg)
                _model = model[model.Body_Label == self.trueIdx]
                self.accuracy_part = 0
                nodes = self.generateNodes(_model)
                links = self.generateLinks(_model)
        
        dNetJson = {'nodes': nodes, 'links': links}
        
        return dNetJson
    
    def generateNodes(self, model):
        
        tn, fp, fn, tp = confusion_matrix(y_true = model.Abnormal_Label,
                                                y_pred = model.Abnormal_Prediction).ravel()
            
            #set node dictionary  
        nodes = [{self.nkeys[0] : self.predPart,                                       #name
                      self.nkeys[1] : self.color[self.predPart],                       #color
                      self.nkeys[2] : self.accuracy_part},                             #accuracy
                     
                    {self.nkeys[0] : self.classes[0], 
                     self.nkeys[1] : self.color[self.classes[0]], 
                     self.nkeys[2] : float(tp/(tp+fn))},
                     
                    {self.nkeys[0] : self.classes[1],
                     self.nkeys[1] : self.color[self.classes[1]],
                     self.nkeys[2] : float(tn/(tn+fp))}]
            
        return nodes
        
    def generateLinks(self, model):
        
        # gives a pandas series object; get counts of a body-part classified as normal/abnormal
        # by indexing [body_label, abnormal_label]; 
        part_abnormality = model.groupby(['Body_Label', 'Abnormal_Prediction']).size()
        filter_parts = part_abnormality.index.get_level_values(0)                       #body_label
        filter_abnormality = part_abnormality.index.get_level_values(1)                 #abnormality
        links = []
        for part, abn in zip(filter_parts, filter_abnormality):
            links.extend([{ self.lkeys[0] : 0,                                          #source
                     self.lkeys[1] : int(abn)+1,                                        #tagert
                     self.lkeys[2] : 1,                                                 #value
                     self.lkeys[3] : int(part_abnormality[part, abn]),                  #count
                     self.lkeys[4] : self.color[self.classes[abn]]}])                   #color

        return links
