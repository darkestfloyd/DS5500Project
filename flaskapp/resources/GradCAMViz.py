from flask_restful import Resource

class GradCAMViz(Resource):

    def __init__(self, **kwargs):
       self.data = kwargs['data']
       self.body_parts = kwargs['body_parts']
    
    def get(self, category):
        #category = random if category is random, else body part
        

