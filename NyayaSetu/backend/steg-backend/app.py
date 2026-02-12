from flask import Flask, request, jsonify, send_file, make_response
from stegano import lsb
from werkzeug.utils import secure_filename
from PIL import Image, ImageChops, ImageEnhance
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = 'uploads'
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route('/analyze-steganography', methods=['POST'])
def analyze_steganography():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image = request.files['image']
        if image.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        filename = secure_filename(image.filename)
        save_path = os.path.join(UPLOAD_DIR, filename)
        image.save(save_path)

        print(f"[DEBUG] Saved file to {save_path}")

        try:
            hidden_message = lsb.reveal(save_path)
            print(f"[DEBUG] Hidden message: {hidden_message}")
        except IndexError:
            hidden_message = None

        if hidden_message and hidden_message.strip():
            return jsonify({"result": "Hidden Message", "message": hidden_message})
        else:
            return jsonify({"result": "No hidden data found"})

    except Exception as e:
        import traceback
        print("[ERROR]", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route('/analyze-ela', methods=['POST'])
def analyze_ela():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        image = request.files['image']
        filename = secure_filename(image.filename)
        path = os.path.join(UPLOAD_DIR, filename)
        image.save(path)

        # Perform ELA
        original = Image.open(path).convert('RGB')
        ela_jpeg_path = os.path.join(UPLOAD_DIR, f"ela_{filename}")
        original.save(ela_jpeg_path, 'JPEG', quality=95)
        compressed = Image.open(ela_jpeg_path)

        diff = ImageChops.difference(original, compressed)
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        scale = 255.0 / max_diff if max_diff != 0 else 1
        ela_image = ImageEnhance.Brightness(diff).enhance(scale)

        ela_result_path = os.path.join(UPLOAD_DIR, f"ela_result_{filename}")
        ela_image.save(ela_result_path)

        response = make_response(send_file(ela_result_path, mimetype='image/jpeg'))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

    except Exception as e:
        import traceback
        print("[ERROR]", traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    

@app.route('/analyze-hidden-pixels', methods=['POST'])
def analyze_hidden_pixels():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        image = request.files['image']
        filename = secure_filename(image.filename)
        path = os.path.join(UPLOAD_DIR, filename)
        image.save(path)

        img = Image.open(path).convert("RGB")
        pixels = img.getdata()
        
        hidden_pixel_count = 0
        for pixel in pixels:
            r, g, b = pixel
            if r % 2 != 0 or g % 2 != 0 or b % 2 != 0:
                hidden_pixel_count += 1

        total_pixels = len(pixels)
        ratio = (hidden_pixel_count / total_pixels) * 100

        return jsonify({
            'result': f'{hidden_pixel_count} pixels have least significant bit set (possible hidden data)',
            'percentage': f'{ratio:.2f}% of total pixels'
        })

    except Exception as e:
        import traceback
        print("[ERROR]", traceback.format_exc())
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)