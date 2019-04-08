from flask_restful import Resource

class DenseNetViz(Resource):

    def __init__(self, **kwargs):
        self.data = kwargs['data']
        self.body_parts = kwargs['body_parts']
        self.color = kwargs['color']

    def get(self, predPart, model = 0, view = 'all', truePart):
        
        links = []
        predIdx = body_parts.index[predPart]
        
        #get model
        if model == 0:
            #best model-TBD
            model = data[predPart+'_Model'+0]
        else:
            model = data[predPart+'_Model'+model]

        #get view
        if(view == 'all'):
            nodes = [{'name' : predPart,'color' : color[body_parts.index[predPart]], accuracy: },
                    {'name' : 'Normal', 'color' : <color1>},
                    {'name' : 'Abnormal', 'color' : <color2>}]

        for i, df in enumerate(data.values()):
             if i%16 != 0:
                 continue
             pred_label = int(df.Body_Prediction[0])
             label_counts = df.Body_Label.value_counts()
             accuracy = float(accuracy_score(y_true = df.Body_Label, y_pred = df.Body_Prediction))
             #construct node dictionary 
             nodes.extend([{'name' : body_parts[pred_label],
                 'color' : color[pred_label],
                 'accuracy' : accuracy}])
             #construct link dictionary 
             links.extend([{'source' : 0,
                  'target' : pred_label+1,
                 'value' : 1,
                 'count' : int(label_counts[label]),
                 'color' : color[label]
                 }for label in label_counts.keys()])
        results = {'nodes' : nodes, 'links' : links}
        return results

