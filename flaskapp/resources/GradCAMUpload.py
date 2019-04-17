from flask_restful import Resource
from PIL import Image
import base64
from resources.alex_grad import alexCAM
from resources.dense_grad import denseCAM
import numpy as np

class GradCAMUpload(Resource):

    def __init__(self, **kwargs):
        pass

    def get(self, data):

        original_image = '../d3_gradcam/cams/temp/input_image.png'
        alex_cam_image = '../d3_gradcam/cams/temp/alex_cam.jpg'
        dense_cam_image = '../d3_gradcam/cams/temp/dense_cam.jpg'

        decoded = data.split(',', 1)[1]
        with open(original_image, 'wb') as f:
            f.write(base64.decodebytes(decoded.encode()))

        study_label = alexCAM(original_image, alex_cam_image)
        print("predicted study: {0}".format(study_label))

        model_path = '../models/densenet_' + study_label.lower() + '.pth'
        class_label = denseCAM(original_image, dense_cam_image, model_path)
        print("predicted class: {0}".format(class_label))

        return {"alexNet": {"path": 'cams/temp/alex_cam.jpg', "label": class_label}, 
                "denseNet": {"path": 'cams/temp/dense_cam.jpg', "label": study_label}}
        

