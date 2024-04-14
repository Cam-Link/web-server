from flask import Flask, render_template,request, session, jsonify, send_file, make_response
import requests
import json
import socket

app = Flask(__name__)
app.secret_key = "ahtye33rk@#!7798s"
host_address = socket.gethostbyname(socket.gethostname())
# host_address = "127.0.0.1"

django = "192.168.171.143"
django_port = 8000


def send(method,address, data={}, vid="0", blob="0"):
    url = f'https://{django}:{django_port}/' + address


    if method == "POST":
        if blob == "1":
            # headers = {'Content-Type':'video/webm'}
            response = requests.post(url, files=data, verify=False, cookies=session.get('session', ''))
        else:
            headers = {'Content-Type':'application/json'}
            response = requests.post(url, json=data, headers=headers, verify=False, cookies=session.get('session', ''))

    elif method == "GET":
        if blob == "1":
            headers = {'Content-Type':'video/webm'}
            response = requests.get(url, data=data, headers=headers, verify=False, cookies=session.get('session', ''))
        else:
            headers = {'Content-Type':'application/json'}
            response = requests.get(url, json=data, headers=headers, verify=False, cookies=session.get('session', ''))

    if response.cookies:
        session['session'] = response.cookies.get_dict()
    

    if vid == "1":

        content_type = response.headers.get('Content-Type')

        if 'application/json' in content_type:
            return [response.text, True]
            

        return [response.content, False]
    else:
        return response.text







@app.route('/requester/', methods=['POST'])
def requester():

    data = json.loads(request.data)

    response = send(data['method'],data['address'],data['data'],data['vid'],data['blob'])

    if data['vid'] == "1":

        if response[1]:
            new_response = make_response(response[0])
            new_response.headers['Content-Type'] = 'application/json'

            return new_response
        
        return response[0]

    
    
    return response

    
        



@app.route('/camlink/start/interval_worker.js/')
def worker():

    return send_file("./static/js/interval_worker.js")



@app.route('/camlink/start/play_worker.js/')
def pp():

    return send_file("./static/js/play_worker.js")
    


# num = 0
@app.route('/streamer/', methods=['POST'])
def streamer():
    # global num

    # chunk = request.files['chunk']
    chunk = request.files


    response = send("POST","camlink/stream/",chunk,"0","1")

    # with open(f'{num}.webm','ab') as clip:
    #     clip.write(chunk.read())

    # num = num + 1

    # return jsonify({"msg":"again"})
    return response


@app.route('/camlink/')
def camlink():
    return render_template('camlink.html')





@app.route('/camlink/start/')
def camstart():
    return render_template('camstart.html')





@app.route('/camlink/record/')
def record():
    return render_template('record.html')





@app.route('/screenshare/')
def screenshare():
    return render_template('screenshare.html')




@app.route('/screenshare/start/')
def screenstart():
    return render_template('screenstart.html')







# num = 1

# @app.route('/camlink/stream/', methods = ['POST'])
# def stream():
#     global num
#     chunk = request.files['chunk']

    

#     with open(f'video{num}.webm','ab') as clip:
#         clip.write(chunk.read())

#     # num = num + 1

#     return jsonify({'msg':'received'})





if __name__ == "__main__":
    app.run(host=host_address ,port=5500,ssl_context=('cert.pem', 'key.pem'),debug=True)