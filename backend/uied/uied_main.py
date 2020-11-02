from os.path import join as pjoin
import cv2
import os
import time
import json


def resize_height_by_longest_edge(img_path, resize_length=800):
    org = cv2.imread(img_path)
    height, width = org.shape[:2]
    if height > width:
        return resize_length
    else:
        return int(resize_length * (height / width))


def uied(input_path, output_root, params=None,
         is_ip=True, is_clf=False, is_ocr=False, is_merge=False):

    '''
            ele:min-grad: gradient threshold to produce binary map
            ele:ffl-block: fill-flood threshold
            ele:min-ele-area: minimum area for selected elements
            ele:merge-contained-ele: if True, merge elements contained in others
            text:max-word-inline-gap: words with smaller distance than the gap are counted as a line
            text:max-line-gap: lines with smaller distance than the gap are counted as a paragraph

            Tips:
            1. Larger *min-grad* produces fine-grained binary-map while prone to over-segment element to small pieces
            2. Smaller *min-ele-area* leaves tiny elements while prone to produce noises
            3. If not *merge-contained-ele*, the elements inside others will be recognized, while prone to produce noises
            4. The *max-word-inline-gap* and *max-line-gap* should be dependent on the input image size and resolution

            mobile: {'min-grad':4, 'ffl-block':5, 'min-ele-area':25, 'max-word-inline-gap':6, 'max-line-gap':1}
            web   : {'min-grad':3, 'ffl-block':5, 'min-ele-area':25, 'max-word-inline-gap':4, 'max-line-gap':4}
        '''
    if params is None:
        params = {'min-grad': 4, 'ffl-block': 5, 'min-ele-area': 25, 'merge-contained-ele': True,
                  'max-word-inline-gap': 4, 'max-line-gap': 4}
    else:
        params = json.loads(params)
        for i in params:
            if params[i] == 'True':
                params[i] = True
            elif params[i] == 'False':
                params[i] = False
            else:
                params[i] = int(params[i])
    print(params)

    start = time.clock()
    resized_height = resize_height_by_longest_edge(input_path)

    if is_ocr:
        import ocr_east as ocr
        import lib_east.eval as eval
        os.makedirs(pjoin(output_root, 'ocr'), exist_ok=True)
        models = eval.load()
        ocr.east(input_path, output_root, models, params['max-word-inline-gap'],
                 resize_by_height=resized_height, show=False)

    if is_ip:
        import detect_compo.ip_region_proposal as ip
        os.makedirs(pjoin(output_root, 'ip'), exist_ok=True)
        # switch of the classification func
        classifier = None
        if is_clf:
            classifier = {}
            from CNN import CNN
            # classifier['Image'] = CNN('Image')
            classifier['Elements'] = CNN('Elements')
            # classifier['Noise'] = CNN('Noise')
        ip.compo_detection(input_path, output_root,
                           uied_params=params, classifier=classifier,
                           resize_by_height=resized_height, show=False)

    if is_merge:
        import merge
        # os.makedirs(pjoin(output_root, 'merge'), exist_ok=True)
        name = input_path.split('/')[-1][:-4]
        compo_path = pjoin(output_root, 'ip', str(name) + '.json')
        ocr_path = pjoin(output_root, 'ocr', str(name) + '.json')
        merge.incorporate(input_path, compo_path, ocr_path, output_root, params=params,
                          resize_by_height=resized_height, show=False)

    print("[UIED complete in %.3fs]" % (time.clock() - start))
    print(time.ctime(), '\n')
