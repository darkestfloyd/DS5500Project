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

        save_prefix = '../d3_gradcam/'
        rid = np.random.randint(1000)
        original_image = 'cams/temp/input_image_{0}.png'.format(rid)
        alex_cam_image = 'cams/temp/alex_cam_{0}.jpg'.format(rid)
        dense_cam_image = 'cams/temp/dense_cam_{0}.jpg'.format(rid)

        decoded = data.split(',', 1)[1]
        with open(save_prefix + original_image, 'wb') as f:
            f.write(base64.decodebytes(decoded.encode()))

        study_label = alexCAM(save_prefix + original_image, save_prefix + alex_cam_image)
        print("predicted study: {0}".format(study_label))

        model_path = '../models/densenet_' + study_label.lower() + '.pth'
        class_label = denseCAM(save_prefix + original_image, save_prefix + dense_cam_image, model_path)
        print("predicted class: {0}".format(class_label))

        return {"alexNet": {"path": alex_cam_image, "label": class_label}, 
                "denseNet": {"path": dense_cam_image, "label": study_label}}
        

