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

        original_image = '../temp/input_image.png'
        alex_cam_image = '../temp/alex_cam.jpg'
        dense_cam_image = '../temp/dense_cam.jpg'

        decoded = data.split(',', 1)[1]
        with open(original_image, 'wb') as f:
            f.write(base64.decodebytes(decoded.encode()))

        study_label = alexCAM(original_image, alex_cam_image)
        print("predicted study: {0}".format(study_label))

        class_label = denseCAM(original_image, dense_cam_image)
        print("predicted class: {0}".format(class_label))

        return {"alexNet": {"path": alex_cam_image, "label": class_label}, 
                "denseNet": {"path": dense_cam_image, "label": study_label}}
        

