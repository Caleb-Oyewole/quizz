from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Configure the database (a file named site.db will be created)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure the folder to save uploaded files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Define a database model for a Quiz Question
class QuizQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(500), nullable=False)
    options = db.Column(db.String(500), nullable=False)
    correct_answer = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"QuizQuestion('{self.question_text}')"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles the file upload and saves questions to the database."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Process the uploaded file
        try:
            with open(filepath, 'r') as f:
                lines = f.readlines()
                
            # Parse the text file content and create question objects
            questions_to_add = []
            current_question = {}
            for line in lines:
                line = line.strip()
                if line.startswith("Question:"):
                    # Save the previous question if it exists
                    if current_question:
                        questions_to_add.append(current_question)
                    current_question = {'question_text': line.split(':', 1)[1].strip()}
                elif line.startswith("Options:"):
                    current_question['options'] = line.split(':', 1)[1].strip()
                elif line.startswith("Correct Answer:"):
                    current_question['correct_answer'] = line.split(':', 1)[1].strip()
            
            # Add the last question to the list
            if current_question:
                questions_to_add.append(current_question)

            # Add all questions to the database
            for q_data in questions_to_add:
                new_question = QuizQuestion(
                    question_text=q_data['question_text'],
                    options=q_data['options'],
                    correct_answer=q_data['correct_answer']
                )
                db.session.add(new_question)
            
            db.session.commit()
            
            return jsonify({
                'message': f'File {file.filename} uploaded and questions saved successfully!',
                'question_count': len(questions_to_add)
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

    return jsonify({'error': 'An unknown error occurred'}), 500

if __name__ == '__main__':
    with app.app_context():
        # Create the database tables if they don't exist
        db.create_all()
    app.run(debug=True)