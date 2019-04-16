from flask_restful import Resource
import random
import os
import pandas as pd

class GradCAMViz(Resource):

    def __init__(self, **kwargs):
        self.data = kwargs['data']
        self.body_parts = kwargs['body_parts']
        self.img_id = 0
        self.prefix = 'CAM'
        self.iter = [5, 10, 15, 20]
        self.path = kwargs['path']
        self.abnClass = ['Normal', 'Abnormal']
        self.part_imgs = kwargs['part_imgs']

    def get(self, category):
        alexNet = {}
        denseNet = {}
        #category = random if category is random, else body part
        if(category != '0'):
            self.category = int(category) - 1
            self.part = self.body_parts[self.category]
            self.img_id = str(random.randint(0, 5))
            self.imgs = [(self.prefix + self.img_id + '_' + str(i) + '.jpg') for i in self.iter]
            self.img1_path = [os.path.join(self.path, self.body_parts[self.category], 'Alexnet_Images', img)
                                for img in self.imgs]
            self.model_id = 'Model' + str(random.randint(1,16))
            dkey = self.body_parts[self.category] + '_' + self.model_id
            df = self.data[dkey]
            #generate paths
            self.img2_path = [os.path.join(self.path, self.body_parts[self.category], self.model_id, img)
                             for img in self.imgs]
            #generate json
            idx = df[df.Path == self.part_imgs[self.part][int(self.img_id)]].index.astype(int)[0]
            alexNet =  {'pred_label' : self.body_parts[df.Body_Prediction[idx].astype(int)],
                'true_label' : self.body_parts[df.Body_Label[idx].astype(int)],
                'paths' : self.img1_path
                }
            denseNet = {'pred_label' : self.abnClass[df.Abnormal_Prediction[idx].astype(int)],
                       'true_label' : self.abnClass[df.Abnormal_Label[idx].astype(int)],
                       'paths' : self.img2_path}
            
            return {'alexNet' : alexNet, 'denseNet' : denseNet}
        
        else:
            category = str(random.randint(1,7))
            result = self.get(category)

        return result
            
