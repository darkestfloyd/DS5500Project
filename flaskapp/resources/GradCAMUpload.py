from flask_restful import Resource
from PIL import Image
import base64
from resources.alex_grad import predict_and_cam

class GradCAMUpload(Resource):

    def __init__(self, **kwargs):
        pass

    def get(self, data):
        decoded = data.split(',', 1)[1]
        with open('../temp/temp.png', 'wb') as f:
            f.write(base64.decodebytes(decoded.encode()))

        lab = predict_and_cam('../temp/temp.png', '../temp/temp_cam.jpg')
        print("predicted: {0}".format(lab))
        return lab
        

